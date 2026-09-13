const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const { sendEmail, orderConfirmationEmail } = require('../services/emailService');

// @POST /api/orders
const createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod = 'cod', notes } = req.body;
    const cartItems = await Cart.getByUser(req.user.id);
    if (!cartItems.length) return res.status(400).json({ success: false, message: 'Cart is empty' });

    // Validate stock
    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${item.name}` });
      }
    }

    const items = cartItems.map((i) => ({
      product_id: i.product_id,
      name: i.name,
      product_image: i.images ? JSON.parse(i.images)[0] : null,
      quantity: i.quantity,
      price: parseFloat(i.discount_price || i.price),
    }));

    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const shippingCharge = subtotal >= 500 ? 0 : 49;
    const total = subtotal + shippingCharge;

    const { orderId, orderNumber } = await Order.create(req.user.id, {
      items, subtotal, shippingCharge, discount: 0, total, paymentMethod, shippingAddress, notes,
    });

    const order = await Order.findById(orderId);
    try {
      await sendEmail({ to: req.user.email, subject: `Order Confirmed - ${orderNumber}`, html: orderConfirmationEmail(order, req.user) });
    } catch (_) { /* email failure should not break order */ }

    res.status(201).json({ success: true, message: 'Order placed successfully', order });
  } catch (err) { next(err); }
};

// @GET /api/orders
const getUserOrders = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await Order.getByUser(req.user.id, { page: parseInt(page) || 1, limit: parseInt(limit) || 10 });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

// @GET /api/orders/:id
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id, req.user.role === 'admin' ? null : req.user.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) { next(err); }
};

// @PUT /api/orders/:id/cancel
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id, req.user.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage' });
    }
    await Order.updateStatus(req.params.id, 'cancelled');
    res.json({ success: true, message: 'Order cancelled' });
  } catch (err) { next(err); }
};

// Admin: @GET /api/admin/orders
const getAllOrders = async (req, res, next) => {
  try {
    const { page, limit, status, search } = req.query;
    const result = await Order.getAll({ page: parseInt(page) || 1, limit: parseInt(limit) || 20, status, search });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

// Admin: @PUT /api/admin/orders/:id/status
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const valid = ['pending','confirmed','processing','shipped','delivered','cancelled','refunded'];
    if (!valid.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });
    const updated = await Order.updateStatus(req.params.id, status);
    if (!updated) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, message: 'Order status updated' });
  } catch (err) { next(err); }
};

// Admin: @GET /api/admin/orders/report
const getSalesReport = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const report = await Order.getSalesReport(days);
    res.json({ success: true, report });
  } catch (err) { next(err); }
};

module.exports = { createOrder, getUserOrders, getOrderById, cancelOrder, getAllOrders, updateOrderStatus, getSalesReport };
