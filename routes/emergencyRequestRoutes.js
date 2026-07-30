const express = require('express');
const router = express.Router();
const {
  createEmergencyRequest,
  getAllEmergencyRequests,
  getEmergencyRequestById,
  findMatchingDonors,
  connectDonor,
  updateRequestStatus,
} = require('../controllers/emergencyRequestController');
const { protect } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');
const auditLogger = require('../middlewares/auditMiddleware');
router.use(auditLogger('EmergencyRequests'));

/**
 * @swagger
 * tags:
 *   - name: Emergency Requests
 *     description: Emergency blood request submission and donor matching
 */

/**
 * @swagger
 * /emergency-requests:
 *   post:
 *     summary: Submit an emergency blood request
 *     tags: [Emergency Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bloodGroup, unitsRequired, hospitalName, contactInfo]
 *             properties:
 *               bloodGroup:
 *                 type: string
 *                 enum: [A+, A-, B+, B-, AB+, AB-, O+, O-]
 *                 example: O+
 *               unitsRequired:
 *                 type: number
 *                 example: 2
 *               hospitalName:
 *                 type: string
 *                 example: City General Hospital
 *               urgency:
 *                 type: string
 *                 enum: [Low, Medium, High, Critical]
 *                 example: High
 *               contactInfo:
 *                 type: object
 *                 properties:
 *                   phone:
 *                     type: string
 *                     example: "9988776655"
 *                   email:
 *                     type: string
 *                     example: contact@cityhospital.com
 *     responses:
 *       201:
 *         description: Emergency request created
 *   get:
 *     summary: Get all emergency requests (Admin) with optional filters
 *     tags: [Emergency Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, In Progress, Fulfilled, Closed]
 *       - in: query
 *         name: bloodGroup
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of emergency requests
 */
router.post('/', protect, createEmergencyRequest);
router.get('/', protect, authorizeRoles('SuperAdmin', 'HospitalAdmin'), getAllEmergencyRequests);

/**
 * @swagger
 * /emergency-requests/{id}:
 *   get:
 *     summary: Get a single emergency request by ID
 *     tags: [Emergency Requests]
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
 *         description: Emergency request data
 *       404:
 *         description: Request not found
 */
router.get('/:id', protect, getEmergencyRequestById);

/**
 * @swagger
 * /emergency-requests/{id}/matching-donors:
 *   get:
 *     summary: Find eligible donors matching this request's blood group (Admin)
 *     tags: [Emergency Requests]
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
 *         description: List of matching eligible donors
 *       404:
 *         description: Request not found
 */
router.get('/:id/matching-donors', protect, authorizeRoles('SuperAdmin', 'HospitalAdmin'), findMatchingDonors);

/**
 * @swagger
 * /emergency-requests/{id}/connect-donor:
 *   put:
 *     summary: Connect a donor to this emergency request (Admin)
 *     tags: [Emergency Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [donorId]
 *             properties:
 *               donorId:
 *                 type: string
 *                 example: 66a1b2c3d4e5f6a7b8c9d0e1
 *     responses:
 *       200:
 *         description: Donor connected to request
 *       400:
 *         description: Donor already connected
 *       404:
 *         description: Request or donor not found
 */
router.put('/:id/connect-donor', protect, authorizeRoles('SuperAdmin', 'HospitalAdmin'), connectDonor);

/**
 * @swagger
 * /emergency-requests/{id}/status:
 *   put:
 *     summary: Update emergency request status (Admin)
 *     tags: [Emergency Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Pending, In Progress, Fulfilled, Closed]
 *                 example: Fulfilled
 *               adminRemarks:
 *                 type: string
 *                 example: Donor confirmed, blood collected
 *     responses:
 *       200:
 *         description: Status updated
 *       404:
 *         description: Request not found
 */
router.put('/:id/status', protect, authorizeRoles('SuperAdmin', 'HospitalAdmin'), updateRequestStatus);

module.exports = router;