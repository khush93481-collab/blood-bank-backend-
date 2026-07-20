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
const { authorizeRoles } = require('../middlewares/roleMiddleware');

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication and session management
 *   - name: Users
 *     description: User account management (Admin only)
 */

/**
 * @swagger
 * /users/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Test Donor
 *               email:
 *                 type: string
 *                 example: donor1@test.com
 *               password:
 *                 type: string
 *                 example: Test@123
 *               role:
 *                 type: string
 *                 enum: [SuperAdmin, HospitalAdmin, Volunteer, Donor]
 *                 example: Donor
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 */
router.post('/auth/signup', signUp);

/**
 * @swagger
 * /users/auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: donor1@test.com
 *               password:
 *                 type: string
 *                 example: Test@123
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *       401:
 *         description: Invalid credentials
 */
router.post('/auth/login', login);

/**
 * @swagger
 * /users/auth/forgot-password:
 *   post:
 *     summary: Request a password reset email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 example: donor1@test.com
 *     responses:
 *       200:
 *         description: Reset email sent (preview URL returned for testing)
 *       404:
 *         description: User not found
 */
router.post('/auth/forgot-password', forgotPassword);

/**
 * @swagger
 * /users/auth/reset-password/{token}:
 *   put:
 *     summary: Reset password using a reset token
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Reset token received via email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password:
 *                 type: string
 *                 example: NewPass@123
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 */
router.put('/auth/reset-password/:token', resetPassword);

/**
 * @swagger
 * /users/auth/change-password:
 *   put:
 *     summary: Change password for the logged-in user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         description: Current password incorrect / not authenticated
 */
router.put('/auth/change-password', protect, changePassword);

/**
 * @swagger
 * /users/auth/me:
 *   get:
 *     summary: Get the logged-in user's profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile data
 *       401:
 *         description: Not authenticated
 */
router.get('/auth/me', protect, getMe);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a user (SuperAdmin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: User created
 *       403:
 *         description: Access denied
 *   get:
 *     summary: Get all users (SuperAdmin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *       403:
 *         description: Access denied
 */
router.post('/', protect, authorizeRoles('SuperAdmin'), createUser);
router.get('/', protect, authorizeRoles('SuperAdmin'), getAllUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a single user by ID (SuperAdmin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User data
 *       404:
 *         description: User not found
 *   put:
 *     summary: Update a user by ID (SuperAdmin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Updated user data
 *       404:
 *         description: User not found
 *   delete:
 *     summary: Delete a user by ID (SuperAdmin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
router.get('/:id', protect, authorizeRoles('SuperAdmin'), getUserById);
router.put('/:id', protect, authorizeRoles('SuperAdmin'), updateUser);
router.delete('/:id', protect, authorizeRoles('SuperAdmin'), deleteUser);

module.exports = router;