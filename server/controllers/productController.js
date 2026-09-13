const Product = require('../models/productModel');
const Review = require('../models/reviewModel');

// @GET /api/products
const getProducts = async (req, res, next) => {
  try {
    const { page, limit, category, search, minPrice, maxPrice, sort, featured } = req.query;
    const result = await Product.getAll({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 12,
      category, search, minPrice, maxPrice, sort,
      featured: featured === 'true',
    });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

// @GET /api/products/:slug
const getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findBySlug(req.params.slug);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    const related = await Product.getRelated(product.id, product.category_id);
    res.json({ success: true, product, related });
  } catch (err) { next(err); }
};

// @POST /api/products  (admin)
const createProduct = async (req, res, next) => {
  try {
    const images = req.files ? req.files.map((f) => f.filename) : [];
    const id = await Product.create({ ...req.body, images });
    const product = await Product.findById(id);
    res.status(201).json({ success: true, message: 'Product created', product });
  } catch (err) { next(err); }
};

// @PUT /api/products/:id  (admin)
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    const images = req.files?.length ? req.files.map((f) => f.filename) : undefined;
    await Product.update(req.params.id, { ...req.body, ...(images && { images }) });
    const updated = await Product.findById(req.params.id);
    res.json({ success: true, message: 'Product updated', product: updated });
  } catch (err) { next(err); }
};

// @DELETE /api/products/:id  (admin)
const deleteProduct = async (req, res, next) => {
  try {
    await Product.delete(req.params.id);
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) { next(err); }
};

// @GET /api/products/admin/all  (admin)
const getAdminProducts = async (req, res, next) => {
  try {
    const { page, limit, search } = req.query;
    const result = await Product.getAdminAll({ page: parseInt(page) || 1, limit: parseInt(limit) || 20, search: search || '' });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

// @POST /api/products/:id/reviews
const addReview = async (req, res, next) => {
  try {
    const { rating, title, comment } = req.body;
    const productId = parseInt(req.params.id);
    await Review.create({ productId, userId: req.user.id, rating: parseInt(rating), title, comment });
    await Product.updateRating(productId);
    res.status(201).json({ success: true, message: 'Review submitted' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'You have already reviewed this product' });
    next(err);
  }
};

// @GET /api/products/:id/reviews
const getReviews = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await Review.getByProduct(req.params.id, { page: parseInt(page) || 1, limit: parseInt(limit) || 10 });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

module.exports = { getProducts, getProductBySlug, createProduct, updateProduct, deleteProduct, getAdminProducts, addReview, getReviews };
