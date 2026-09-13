const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
  findById: async (id) => {
    const [rows] = await pool.query(
      'SELECT id, name, email, phone, avatar, role, is_verified, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  findByEmail: async (email) => {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  },

  create: async ({ name, email, password, phone, role = 'user' }) => {
    const hashed = await bcrypt.hash(password, 12);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, phone, role, is_verified) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashed, phone || null, role, 1]
    );
    return result.insertId;
  },

  update: async (id, fields) => {
    const allowed = ['name', 'phone', 'avatar'];
    const updates = Object.keys(fields)
      .filter((k) => allowed.includes(k))
      .map((k) => `${k} = ?`);
    const values = Object.keys(fields)
      .filter((k) => allowed.includes(k))
      .map((k) => fields[k]);
    if (!updates.length) return false;
    await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, [...values, id]);
    return true;
  },

  updatePassword: async (id, newPassword) => {
    const hashed = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, id]);
  },

  setResetToken: async (email, token, expiry) => {
    await pool.query('UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?', [token, expiry, email]);
  },

  findByResetToken: async (token) => {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()',
      [token]
    );
    return rows[0] || null;
  },

  clearResetToken: async (id) => {
    await pool.query('UPDATE users SET reset_token = NULL, reset_token_expiry = NULL WHERE id = ?', [id]);
  },

  comparePassword: async (plain, hashed) => bcrypt.compare(plain, hashed),

  getAll: async ({ page = 1, limit = 20, search = '' }) => {
    const offset = (page - 1) * limit;
    const like = `%${search}%`;
    const [rows] = await pool.query(
      `SELECT id, name, email, phone, avatar, role, is_verified, created_at 
       FROM users WHERE name LIKE ? OR email LIKE ? 
       ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [like, like, limit, offset]
    );
    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) as total FROM users WHERE name LIKE ? OR email LIKE ?',
      [like, like]
    );
    return { users: rows, total, page, limit, pages: Math.ceil(total / limit) };
  },

  deleteById: async (id) => {
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
  },
};

module.exports = User;
