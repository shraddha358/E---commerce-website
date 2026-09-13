const User = require('../models/userModel');
const { generateToken } = require('../utils/tokenUtils');
const { sendEmail, passwordResetEmail } = require('../services/emailService');
const crypto = require('crypto');

// @POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    const existing = await User.findByEmail(email);
    if (existing) return res.status(409).json({ success: false, message: 'Email already registered' });

    const id = await User.create({ name, email, password, phone });
    const user = await User.findById(id);
    const token = generateToken(id);
    res.status(201).json({ success: true, message: 'Registration successful', token, user });
  } catch (err) { next(err); }
};

// @POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);
    if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const match = await User.comparePassword(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const token = generateToken(user.id);
    const { password: _, ...safeUser } = user;
    res.json({ success: true, message: 'Login successful', token, user: safeUser });
  } catch (err) { next(err); }
};

// @GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

// @PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (req.file) updates.avatar = req.file.filename;
    await User.update(req.user.id, updates);
    const user = await User.findById(req.user.id);
    res.json({ success: true, message: 'Profile updated', user });
  } catch (err) { next(err); }
};

// @PUT /api/auth/change-password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByEmail(req.user.email);
    const match = await User.comparePassword(currentPassword, user.password);
    if (!match) return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    await User.updatePassword(req.user.id, newPassword);
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) { next(err); }
};

// @POST /api/auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findByEmail(email);
    if (!user) return res.json({ success: true, message: 'If the email exists, a reset link has been sent' });

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 3600000); // 1 hour
    await User.setResetToken(email, token, expiry);

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
    await sendEmail({ to: email, subject: 'Password Reset - ShopEase', html: passwordResetEmail(user.name, resetUrl) });
    res.json({ success: true, message: 'Password reset email sent' });
  } catch (err) { next(err); }
};

// @POST /api/auth/reset-password/:token
const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const user = await User.findByResetToken(token);
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    await User.updatePassword(user.id, password);
    await User.clearResetToken(user.id);
    res.json({ success: true, message: 'Password reset successful' });
  } catch (err) { next(err); }
};

module.exports = { register, login, getMe, updateProfile, changePassword, forgotPassword, resetPassword };
