const { pool } = require('../config/db');
const slugify = require('slugify');

const Product = {
  getAll: async ({ page = 1, limit = 12, category, search, minPrice, maxPrice, sort, featured }) => {
    const offset = (page - 1) * limit;
    let where = ['p.is_active = 1'];
    const params = [];

    if (category) { where.push('c.slug = ?'); params.push(category); }
    if (search) { where.push('MATCH(p.name, p.description, p.brand) AGAINST(? IN BOOLEAN MODE)'); params.push(`*${search}*`); }
    if (minPrice) { where.push('p.price >= ?'); params.push(minPrice); }
    if (maxPrice) { where.push('p.price <= ?'); params.push(maxPrice); }
    if (featured) { where.push('p.is_featured = 1'); }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const sortMap = {
      'price_asc': 'p.price ASC',
      'price_desc': 'p.price DESC',
      'newest': 'p.created_at DESC',
      'rating': 'p.rating_avg DESC',
      'popular': 'p.rating_count DESC',
    };
    const orderBy = sortMap[sort] || 'p.created_at DESC';

    const [rows] = await pool.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p JOIN categories c ON p.category_id = c.id
       ${whereClause} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM products p JOIN categories c ON p.category_id = c.id ${whereClause}`,
      params
    );
    return { products: rows, total, page, limit, pages: Math.ceil(total / limit) };
  },

  findById: async (id) => {
    const [rows] = await pool.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p JOIN categories c ON p.category_id = c.id WHERE p.id = ? AND p.is_active = 1`,
      [id]
    );
    return rows[0] || null;
  },

  findBySlug: async (slug) => {
    const [rows] = await pool.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p JOIN categories c ON p.category_id = c.id WHERE p.slug = ? AND p.is_active = 1`,
      [slug]
    );
    return rows[0] || null;
  },

  create: async (data) => {
    const slug = slugify(data.name, { lower: true, strict: true }) + '-' + Date.now();
    const images = JSON.stringify(data.images || []);
    const [result] = await pool.query(
      `INSERT INTO products (category_id, name, slug, description, price, discount_price, stock, images, brand, sku, is_active, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.category_id, data.name, slug, data.description, data.price, data.discount_price || null,
       data.stock || 0, images, data.brand || null, data.sku || null, data.is_active ?? 1, data.is_featured ?? 0]
    );
    return result.insertId;
  },

  update: async (id, data) => {
    const fields = [];
    const values = [];
    const allowed = ['category_id','name','description','price','discount_price','stock','images','brand','sku','is_active','is_featured'];
    allowed.forEach((k) => {
      if (data[k] !== undefined) {
        fields.push(`${k} = ?`);
        values.push(k === 'images' ? JSON.stringify(data[k]) : data[k]);
      }
    });
    if (data.name) { fields.push('slug = ?'); values.push(slugify(data.name, { lower: true, strict: true }) + '-' + id); }
    if (!fields.length) return false;
    await pool.query(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, [...values, id]);
    return true;
  },

  delete: async (id) => {
    await pool.query('UPDATE products SET is_active = 0 WHERE id = ?', [id]);
  },

  updateRating: async (productId) => {
    await pool.query(
      `UPDATE products SET 
        rating_avg = (SELECT ROUND(AVG(rating), 2) FROM reviews WHERE product_id = ? AND is_approved = 1),
        rating_count = (SELECT COUNT(*) FROM reviews WHERE product_id = ? AND is_approved = 1)
       WHERE id = ?`,
      [productId, productId, productId]
    );
  },

  decrementStock: async (productId, qty) => {
    await pool.query('UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?', [qty, productId, qty]);
  },

  getRelated: async (productId, categoryId, limit = 4) => {
    const [rows] = await pool.query(
      `SELECT p.*, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id
       WHERE p.category_id = ? AND p.id != ? AND p.is_active = 1 LIMIT ?`,
      [categoryId, productId, limit]
    );
    return rows;
  },

  getAdminAll: async ({ page = 1, limit = 20, search = '' }) => {
    const offset = (page - 1) * limit;
    const like = `%${search}%`;
    const [rows] = await pool.query(
      `SELECT p.*, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id
       WHERE p.name LIKE ? OR p.brand LIKE ? OR p.sku LIKE ?
       ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
      [like, like, like, limit, offset]
    );
    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) as total FROM products WHERE name LIKE ? OR brand LIKE ? OR sku LIKE ?',
      [like, like, like]
    );
    return { products: rows, total, page, pages: Math.ceil(total / limit) };
  },
};

module.exports = Product;
