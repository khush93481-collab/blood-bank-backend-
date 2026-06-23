const express = require('express');
const router = express.Router();
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  signUp,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  getMe,
} = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

// Auth Routes (public)
router.post('/auth/signup', signUp);
router.post('/auth/login', login);
router.post('/auth/forgot-password', forgotPassword);
router.put('/auth/reset-password/:token', resetPassword);

// Auth Routes (protected)
router.put('/auth/change-password', protect, changePassword);
router.get('/auth/me', protect, getMe);

// User CRUD Routes (protected)
router.post('/', protect, createUser);
router.get('/', protect, getAllUsers);
router.get('/:id', protect, getUserById);
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, deleteUser);

module.exports = router;