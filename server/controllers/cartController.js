const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

// @GET /api/cart
const getCart = async (req, res, next) => {
  try {
    const items = await Cart.getByUser(req.user.id);
    const subtotal = items.reduce((sum, i) => sum + (parseFloat(i.discount_price || i.price) * i.quantity), 0);
    res.json({ success: true, items, subtotal: parseFloat(subtotal.toFixed(2)), itemCount: items.length });
  } catch (err) { next(err); }
};

// @POST /api/cart
const addToCart = async (req, res, next) => {
  try {
    const { product_id, quantity = 1 } = req.body;
    const product = await Product.findById(product_id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    if (product.stock < quantity) return res.status(400).json({ success: false, message: 'Insufficient stock' });

    await Cart.addOrUpdate(req.user.id, product_id, parseInt(quantity));
    const items = await Cart.getByUser(req.user.id);
    res.json({ success: true, message: 'Item added to cart', items });
  } catch (err) { next(err); }
};

// @PUT /api/cart/:id
const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    if (quantity < 1) return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    const updated = await Cart.updateQuantity(req.params.id, req.user.id, parseInt(quantity));
    if (!updated) return res.status(404).json({ success: false, message: 'Cart item not found' });
    const items = await Cart.getByUser(req.user.id);
    res.json({ success: true, message: 'Cart updated', items });
  } catch (err) { next(err); }
};

// @DELETE /api/cart/:id
const removeCartItem = async (req, res, next) => {
  try {
    const removed = await Cart.removeItem(req.params.id, req.user.id);
    if (!removed) return res.status(404).json({ success: false, message: 'Cart item not found' });
    const items = await Cart.getByUser(req.user.id);
    res.json({ success: true, message: 'Item removed', items });
  } catch (err) { next(err); }
};

// @DELETE /api/cart
const clearCart = async (req, res, next) => {
  try {
    await Cart.clearCart(req.user.id);
    res.json({ success: true, message: 'Cart cleared', items: [] });
  } catch (err) { next(err); }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
