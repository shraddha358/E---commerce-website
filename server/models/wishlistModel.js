const { pool } = require('../config/db');

const Wishlist = {
  getByUser: async (userId) => {
    const [rows] = await pool.query(
      `SELECT w.id, w.product_id, w.created_at,
              p.name, p.price, p.discount_price, p.images, p.rating_avg, p.slug, p.stock
       FROM wishlist w JOIN products p ON w.product_id = p.id
       WHERE w.user_id = ? AND p.is_active = 1 ORDER BY w.created_at DESC`,
      [userId]
    );
    return rows;
  },

  add: async (userId, productId) => {
    await pool.query(
      'INSERT IGNORE INTO wishlist (user_id, product_id) VALUES (?, ?)',
      [userId, productId]
    );
  },

  remove: async (userId, productId) => {
    const [result] = await pool.query(
      'DELETE FROM wishlist WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );
    return result.affectedRows > 0;
  },

  isWishlisted: async (userId, productId) => {
    const [rows] = await pool.query(
      'SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );
    return rows.length > 0;
  },
};

module.exports = Wishlist;
