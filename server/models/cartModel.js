const { pool } = require('../config/db');

const Cart = {
  getByUser: async (userId) => {
    const [rows] = await pool.query(
      `SELECT c.id, c.quantity, c.product_id, c.user_id,
              p.name, p.price, p.discount_price, p.images, p.stock, p.slug,
              cat.name as category_name
       FROM cart c
       JOIN products p ON c.product_id = p.id
       JOIN categories cat ON p.category_id = cat.id
       WHERE c.user_id = ? AND p.is_active = 1
       ORDER BY c.created_at DESC`,
      [userId]
    );
    return rows;
  },

  addOrUpdate: async (userId, productId, quantity) => {
    await pool.query(
      `INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = ?`,
      [userId, productId, quantity, quantity]
    );
  },

  updateQuantity: async (cartItemId, userId, quantity) => {
    const [result] = await pool.query(
      'UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?',
      [quantity, cartItemId, userId]
    );
    return result.affectedRows > 0;
  },

  removeItem: async (cartItemId, userId) => {
    const [result] = await pool.query('DELETE FROM cart WHERE id = ? AND user_id = ?', [cartItemId, userId]);
    return result.affectedRows > 0;
  },

  clearCart: async (userId) => {
    await pool.query('DELETE FROM cart WHERE user_id = ?', [userId]);
  },

  getItemCount: async (userId) => {
    const [[{ count }]] = await pool.query(
      'SELECT COALESCE(SUM(quantity), 0) as count FROM cart WHERE user_id = ?',
      [userId]
    );
    return count;
  },
};

module.exports = Cart;
