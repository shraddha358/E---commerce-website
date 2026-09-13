const User = require('../models/userModel');

// @GET /api/admin/users
const getAllUsers = async (req, res, next) => {
  try {
    const { page, limit, search } = req.query;
    const result = await User.getAll({ page: parseInt(page) || 1, limit: parseInt(limit) || 20, search: search || '' });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

// @GET /api/admin/users/:id
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

// @DELETE /api/admin/users/:id
const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id == req.user.id) return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    await User.deleteById(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) { next(err); }
};

// @GET /api/admin/dashboard
const getDashboardStats = async (req, res, next) => {
  try {
    const { pool } = require('../config/db');
    const [[{ totalUsers }]] = await pool.query("SELECT COUNT(*) as totalUsers FROM users WHERE role = 'user'");
    const [[{ totalProducts }]] = await pool.query('SELECT COUNT(*) as totalProducts FROM products WHERE is_active = 1');
    const [[{ totalOrders }]] = await pool.query('SELECT COUNT(*) as totalOrders FROM orders');
    const [[{ totalRevenue }]] = await pool.query("SELECT COALESCE(SUM(total),0) as totalRevenue FROM orders WHERE status != 'cancelled'");
    const [[{ pendingOrders }]] = await pool.query("SELECT COUNT(*) as pendingOrders FROM orders WHERE status = 'pending'");
    const [recentOrders] = await pool.query(
      `SELECT o.id, o.order_number, o.total, o.status, o.created_at, u.name as user_name
       FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC LIMIT 5`
    );
    const [lowStock] = await pool.query('SELECT id, name, stock, sku FROM products WHERE stock <= 10 AND is_active = 1 ORDER BY stock ASC LIMIT 10');

    res.json({
      success: true,
      stats: { totalUsers, totalProducts, totalOrders, totalRevenue: parseFloat(totalRevenue), pendingOrders },
      recentOrders,
      lowStock,
    });
  } catch (err) { next(err); }
};

module.exports = { getAllUsers, getUserById, deleteUser, getDashboardStats };
