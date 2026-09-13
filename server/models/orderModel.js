const { pool } = require('../config/db');
const { generateOrderNumber } = require('../utils/tokenUtils');

const Order = {
  create: async (userId, { items, subtotal, shippingCharge, discount, total, paymentMethod, shippingAddress, notes }) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const orderNumber = generateOrderNumber();
      const [orderResult] = await conn.query(
        `INSERT INTO orders (user_id, order_number, subtotal, shipping_charge, discount, total, payment_method, shipping_address, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, orderNumber, subtotal, shippingCharge || 0, discount || 0, total, paymentMethod, JSON.stringify(shippingAddress), notes || null]
      );
      const orderId = orderResult.insertId;

      for (const item of items) {
        await conn.query(
          `INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price, total)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [orderId, item.product_id, item.name, item.product_image || null, item.quantity, item.price, item.quantity * item.price]
        );
        await conn.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
      }

      await conn.query('DELETE FROM cart WHERE user_id = ?', [userId]);
      await conn.commit();
      return { orderId, orderNumber };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  findById: async (id, userId = null) => {
    let query = `SELECT o.*, u.name as user_name, u.email as user_email
                 FROM orders o JOIN users u ON o.user_id = u.id WHERE o.id = ?`;
    const params = [id];
    if (userId) { query += ' AND o.user_id = ?'; params.push(userId); }
    const [rows] = await pool.query(query, params);
    if (!rows[0]) return null;
    const order = rows[0];
    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [id]);
    order.items = items;
    return order;
  },

  getByUser: async (userId, { page = 1, limit = 10 }) => {
    const offset = (page - 1) * limit;
    const [rows] = await pool.query(
      `SELECT o.*, 
        (SELECT JSON_ARRAYAGG(JSON_OBJECT('product_name', oi.product_name, 'quantity', oi.quantity, 'price', oi.price, 'product_image', oi.product_image))
         FROM order_items oi WHERE oi.order_id = o.id) as items
       FROM orders o WHERE o.user_id = ? ORDER BY o.created_at DESC LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM orders WHERE user_id = ?', [userId]);
    return { orders: rows, total, page, pages: Math.ceil(total / limit) };
  },

  getAll: async ({ page = 1, limit = 20, status, search }) => {
    const offset = (page - 1) * limit;
    let where = [];
    const params = [];
    if (status) { where.push('o.status = ?'); params.push(status); }
    if (search) { where.push('(o.order_number LIKE ? OR u.name LIKE ? OR u.email LIKE ?)'); params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [rows] = await pool.query(
      `SELECT o.*, u.name as user_name, u.email as user_email
       FROM orders o JOIN users u ON o.user_id = u.id
       ${whereClause} ORDER BY o.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM orders o JOIN users u ON o.user_id = u.id ${whereClause}`,
      params
    );
    return { orders: rows, total, page, pages: Math.ceil(total / limit) };
  },

  updateStatus: async (id, status) => {
    const [result] = await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    return result.affectedRows > 0;
  },

  updatePaymentStatus: async (id, paymentStatus, paymentId) => {
    await pool.query('UPDATE orders SET payment_status = ? WHERE id = ?', [paymentStatus, id]);
    if (paymentId) {
      await pool.query(
        `INSERT INTO payments (order_id, payment_gateway, gateway_payment_id, amount, status)
         SELECT id, payment_method, ?, total, ? FROM orders WHERE id = ?
         ON DUPLICATE KEY UPDATE gateway_payment_id = ?, status = ?`,
        [paymentId, paymentStatus, id, paymentId, paymentStatus]
      );
    }
  },

  getSalesReport: async (days = 30) => {
    const [summary] = await pool.query(
      `SELECT 
        COUNT(*) as total_orders,
        SUM(total) as total_revenue,
        AVG(total) as avg_order_value,
        SUM(CASE WHEN status='delivered' THEN 1 ELSE 0 END) as delivered,
        SUM(CASE WHEN status='cancelled' THEN 1 ELSE 0 END) as cancelled
       FROM orders WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [days]
    );
    const [daily] = await pool.query(
      `SELECT DATE(created_at) as date, COUNT(*) as orders, SUM(total) as revenue
       FROM orders WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY DATE(created_at) ORDER BY date ASC`,
      [days]
    );
    const [topProducts] = await pool.query(
      `SELECT oi.product_name, SUM(oi.quantity) as units_sold, SUM(oi.total) as revenue
       FROM order_items oi JOIN orders o ON oi.order_id = o.id
       WHERE o.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) AND o.status != 'cancelled'
       GROUP BY oi.product_id, oi.product_name ORDER BY units_sold DESC LIMIT 10`,
      [days]
    );
    return { summary: summary[0], daily, topProducts };
  },
};

module.exports = Order;
