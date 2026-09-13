const { pool } = require('../config/db');

const Review = {
  getByProduct: async (productId, { page = 1, limit = 10 }) => {
    const offset = (page - 1) * limit;
    const [rows] = await pool.query(
      `SELECT r.*, u.name as user_name, u.avatar as user_avatar
       FROM reviews r JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ? AND r.is_approved = 1
       ORDER BY r.created_at DESC LIMIT ? OFFSET ?`,
      [productId, limit, offset]
    );
    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) as total FROM reviews WHERE product_id = ? AND is_approved = 1',
      [productId]
    );
    return { reviews: rows, total, page, pages: Math.ceil(total / limit) };
  },

  create: async ({ productId, userId, rating, title, comment }) => {
    const [result] = await pool.query(
      'INSERT INTO reviews (product_id, user_id, rating, title, comment) VALUES (?, ?, ?, ?, ?)',
      [productId, userId, rating, title || null, comment || null]
    );
    return result.insertId;
  },

  delete: async (id, userId) => {
    const [result] = await pool.query('DELETE FROM reviews WHERE id = ? AND user_id = ?', [id, userId]);
    return result.affectedRows > 0;
  },

  hasOrdered: async (userId, productId) => {
    const [rows] = await pool.query(
      `SELECT oi.id FROM order_items oi JOIN orders o ON oi.order_id = o.id
       WHERE o.user_id = ? AND oi.product_id = ? AND o.status = 'delivered' LIMIT 1`,
      [userId, productId]
    );
    return rows.length > 0;
  },
};

module.exports = Review;
