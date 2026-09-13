const express = require('express');
const router = express.Router();
const { getProducts, getProductBySlug, createProduct, updateProduct, deleteProduct, getAdminProducts, addReview, getReviews } = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');
const { uploadProduct } = require('../config/multer');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

const productRules = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price required'),
  body('category_id').isInt({ min: 1 }).withMessage('Valid category required'),
  body('stock').isInt({ min: 0 }).withMessage('Valid stock required'),
];

router.get('/', getProducts);
router.get('/admin/all', protect, adminOnly, getAdminProducts);
router.get('/:slug', getProductBySlug);
router.post('/', protect, adminOnly, uploadProduct.array('images', 5), productRules, validate, createProduct);
router.put('/:id', protect, adminOnly, uploadProduct.array('images', 5), updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);
router.post('/:id/reviews', protect, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
], validate, addReview);
router.get('/:id/reviews', getReviews);

module.exports = router;
