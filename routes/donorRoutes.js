const express = require('express');
const router = express.Router();
const {
  createDonorProfile,
  getMyDonorProfile,
  updateMyDonorProfile,
  getAllDonors,
  getDonorById,
  deleteDonor,
} = require('../controllers/donorController');
const { protect } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');
const auditLogger = require('../middlewares/auditMiddleware');
router.use(auditLogger('Donors'));

/**
 * @swagger
 * tags:
 *   - name: Donors
 *     description: Donor registration, medical screening, and profile management
 */

/**
 * @swagger
 * /donors:
 *   post:
 *     summary: Create donor profile for the logged-in user
 *     tags: [Donors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [age, gender, bloodGroup, address]
 *             properties:
 *               age:
 *                 type: number
 *                 example: 28
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *                 example: Male
 *               bloodGroup:
 *                 type: string
 *                 enum: [A+, A-, B+, B-, AB+, AB-, O+, O-]
 *                 example: O+
 *               address:
 *                 type: string
 *                 example: 123 MG Road, Dhanbad
 *               emergencyContact:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: Jane Doe
 *                   phone:
 *                     type: string
 *                     example: "9123456780"
 *               weight:
 *                 type: number
 *                 example: 65
 *               bloodPressure:
 *                 type: string
 *                 example: "120/80"
 *               hemoglobinLevel:
 *                 type: number
 *                 example: 13.5
 *               lastDonationDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-03-01
 *               existingMedicalConditions:
 *                 type: string
 *                 example: None
 *     responses:
 *       201:
 *         description: Donor profile created
 *   get:
 *     summary: Get all donors (Admin) with optional filters
 *     tags: [Donors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: bloodGroup
 *         schema:
 *           type: string
 *       - in: query
 *         name: eligibilityStatus
 *         schema:
 *           type: string
 *           enum: [Eligible, Not Eligible, Pending Review]
 *       - in: query
 *         name: address
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of donors
 */
router.post('/', protect, createDonorProfile);
router.get('/', protect, authorizeRoles('SuperAdmin', 'HospitalAdmin'), getAllDonors);

/**
 * @swagger
 * /donors/me:
 *   get:
 *     summary: Get logged-in donor's own profile
 *     tags: [Donors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Donor profile data
 *       404:
 *         description: Donor profile not found
 *   put:
 *     summary: Update logged-in donor's own profile (including medical screening)
 *     tags: [Donors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               weight:
 *                 type: number
 *               bloodPressure:
 *                 type: string
 *               hemoglobinLevel:
 *                 type: number
 *               lastDonationDate:
 *                 type: string
 *                 format: date
 *               existingMedicalConditions:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated donor profile
 *       404:
 *         description: Donor profile not found
 */
router.get('/me', protect, getMyDonorProfile);
router.put('/me', protect, updateMyDonorProfile);

/**
 * @swagger
 * /donors/{id}:
 *   get:
 *     summary: Get a single donor by ID (Admin)
 *     tags: [Donors]
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
 *         description: Donor data
 *       404:
 *         description: Donor not found
 *   delete:
 *     summary: Delete a donor profile (Admin)
 *     tags: [Donors]
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
 *         description: Donor deleted
 *       404:
 *         description: Donor not found
 */
router.get('/:id', protect, authorizeRoles('SuperAdmin', 'HospitalAdmin'), getDonorById);
router.delete('/:id', protect, authorizeRoles('SuperAdmin'), deleteDonor);

module.exports = router;