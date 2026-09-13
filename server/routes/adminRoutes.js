const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, deleteUser, getDashboardStats } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);
router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.delete('/users/:id', deleteUser);

module.exports = router;
