const { pool } = require('../config/db');
const slugify = require('slugify');

const Category = {
  getAll: async (activeOnly = false) => {
    const where = activeOnly ? 'WHERE is_active = 1' : '';
    const [rows] = await pool.query(
      `SELECT c.*, COUNT(p.id) as product_count 
       FROM categories c LEFT JOIN products p ON p.category_id = c.id AND p.is_active = 1
       ${where} GROUP BY c.id ORDER BY c.name ASC`
    );
    return rows;
  },

  findById: async (id) => {
    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
    return rows[0] || null;
  },

  findBySlug: async (slug) => {
    const [rows] = await pool.query('SELECT * FROM categories WHERE slug = ?', [slug]);
    return rows[0] || null;
  },

  create: async ({ name, description, image }) => {
    const slug = slugify(name, { lower: true, strict: true });
    const [result] = await pool.query(
      'INSERT INTO categories (name, slug, description, image) VALUES (?, ?, ?, ?)',
      [name, slug, description || null, image || null]
    );
    return result.insertId;
  },

  update: async (id, { name, description, image, is_active }) => {
    const fields = [];
    const values = [];
    if (name !== undefined) { fields.push('name = ?', 'slug = ?'); values.push(name, slugify(name, { lower: true, strict: true })); }
    if (description !== undefined) { fields.push('description = ?'); values.push(description); }
    if (image !== undefined) { fields.push('image = ?'); values.push(image); }
    if (is_active !== undefined) { fields.push('is_active = ?'); values.push(is_active); }
    if (!fields.length) return false;
    await pool.query(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`, [...values, id]);
    return true;
  },

  delete: async (id) => {
    await pool.query('DELETE FROM categories WHERE id = ?', [id]);
  },
};

module.exports = Category;
