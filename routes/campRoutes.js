const express = require('express');
const router = express.Router();
const {
  createCamp,
  getAllCamps,
  getCampById,
  updateCamp,
  deleteCamp,
  submitForApproval,
  approveCamp,
  rejectCamp,
  activateCamp,
  completeCamp,
  cancelCamp,
} = require('../controllers/campController');
const { protect } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');
const {
  assignVolunteer,
  getCampVolunteers,
  updateVolunteerAssignment,
  removeVolunteerAssignment,
} = require('../controllers/volunteerAssignmentController');

/**
 * @swagger
 * /camps/{id}/volunteers:
 *   post:
 *     summary: Assign a volunteer to a camp
 *     tags: [Camps]
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
 *             required: [volunteerId, responsibility]
 *             properties:
 *               volunteerId:
 *                 type: string
 *                 example: 66a1b2c3d4e5f6a7b8c9d0e1
 *               responsibility:
 *                 type: string
 *                 example: Registration desk coordinator
 *     responses:
 *       201:
 *         description: Volunteer assigned
 *   get:
 *     summary: Get all volunteers assigned to a camp
 *     tags: [Camps]
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
 *         description: List of volunteer assignments
 */
router.post('/:id/volunteers', protect, authorizeRoles('HospitalAdmin', 'SuperAdmin'), assignVolunteer);
router.get('/:id/volunteers', protect, getCampVolunteers);

/**
 * @swagger
 * /camps/{id}/volunteers/{assignmentId}:
 *   put:
 *     summary: Update a volunteer's assigned responsibility
 *     tags: [Camps]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: assignmentId
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
 *               responsibility:
 *                 type: string
 *                 example: Blood collection supervisor
 *     responses:
 *       200:
 *         description: Assignment updated
 *   delete:
 *     summary: Remove a volunteer from a camp
 *     tags: [Camps]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Volunteer removed from camp
 */
router.put('/:id/volunteers/:assignmentId', protect, authorizeRoles('HospitalAdmin', 'SuperAdmin'), updateVolunteerAssignment);
router.delete('/:id/volunteers/:assignmentId', protect, authorizeRoles('HospitalAdmin', 'SuperAdmin'), removeVolunteerAssignment);

/**
 * @swagger
 * tags:
 *   - name: Camps
 *     description: Blood donation camp lifecycle management
 */

/**
 * @swagger
 * /camps:
 *   post:
 *     summary: Create a new camp (HospitalAdmin)
 *     tags: [Camps]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, dateTime, venue]
 *             properties:
 *               name:
 *                 type: string
 *                 example: City Blood Drive
 *               dateTime:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-08-15T09:00:00.000Z
 *               venue:
 *                 type: string
 *                 example: Community Hall, Sector 5
 *               expectedDonors:
 *                 type: number
 *                 example: 100
 *               bloodGroupsRequired:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [A+, A-, B+, B-, AB+, AB-, O+, O-]
 *                 example: ["O+", "A+", "B-"]
 *               description:
 *                 type: string
 *                 example: Monthly community blood donation camp
 *               contactDetails:
 *                 type: object
 *                 properties:
 *                   phone:
 *                     type: string
 *                     example: "9876543210"
 *                   email:
 *                     type: string
 *                     example: org@hospital.com
 *     responses:
 *       201:
 *         description: Camp created
 *   get:
 *     summary: Get all camps (optional ?status= filter)
 *     tags: [Camps]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [Draft, Pending Approval, Approved, Rejected, Active, Completed, Cancelled]
 *         description: Filter camps by status
 *     responses:
 *       200:
 *         description: List of camps
 */
router.post('/', protect, authorizeRoles('HospitalAdmin', 'SuperAdmin'), createCamp);
router.get('/', protect, getAllCamps);

/**
 * @swagger
 * /camps/{id}:
 *   get:
 *     summary: Get a single camp by ID
 *     tags: [Camps]
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
 *         description: Camp data
 *       404:
 *         description: Camp not found
 *   put:
 *     summary: Update camp details
 *     tags: [Camps]
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
 *               name:
 *                 type: string
 *               dateTime:
 *                 type: string
 *                 format: date-time
 *               venue:
 *                 type: string
 *               expectedDonors:
 *                 type: number
 *               bloodGroupsRequired:
 *                 type: array
 *                 items:
 *                   type: string
 *               description:
 *                 type: string
 *               contactDetails:
 *                 type: object
 *                 properties:
 *                   phone:
 *                     type: string
 *                   email:
 *                     type: string
 *     responses:
 *       200:
 *         description: Updated camp
 *       404:
 *         description: Camp not found
 *   delete:
 *     summary: Delete a camp
 *     tags: [Camps]
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
 *         description: Camp deleted
 *       404:
 *         description: Camp not found
 */
router.get('/:id', protect, getCampById);
router.put('/:id', protect, authorizeRoles('HospitalAdmin', 'SuperAdmin'), updateCamp);
router.delete('/:id', protect, authorizeRoles('SuperAdmin'), deleteCamp);

/**
 * @swagger
 * /camps/{id}/submit:
 *   put:
 *     summary: Submit camp for approval (Draft -> Pending Approval)
 *     tags: [Camps]
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
 *         description: Camp submitted for approval
 *       400:
 *         description: Only Draft camps can be submitted
 *       404:
 *         description: Camp not found
 */
router.put('/:id/submit', protect, authorizeRoles('HospitalAdmin', 'SuperAdmin'), submitForApproval);

/**
 * @swagger
 * /camps/{id}/approve:
 *   put:
 *     summary: Approve a camp (SuperAdmin only)
 *     tags: [Camps]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               remarks:
 *                 type: string
 *                 example: Approved, venue confirmed
 *     responses:
 *       200:
 *         description: Camp approved
 *       400:
 *         description: Only camps pending approval can be approved
 *       404:
 *         description: Camp not found
 */
router.put('/:id/approve', protect, authorizeRoles('SuperAdmin'), approveCamp);

/**
 * @swagger
 * /camps/{id}/reject:
 *   put:
 *     summary: Reject a camp (SuperAdmin only)
 *     tags: [Camps]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               remarks:
 *                 type: string
 *                 example: Venue unavailable on this date
 *     responses:
 *       200:
 *         description: Camp rejected
 *       400:
 *         description: Only camps pending approval can be rejected
 *       404:
 *         description: Camp not found
 */
router.put('/:id/reject', protect, authorizeRoles('SuperAdmin'), rejectCamp);

/**
 * @swagger
 * /camps/{id}/activate:
 *   put:
 *     summary: Activate a camp (Approved -> Active)
 *     tags: [Camps]
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
 *         description: Camp activated
 *       400:
 *         description: Only Approved camps can be activated
 *       404:
 *         description: Camp not found
 */
router.put('/:id/activate', protect, authorizeRoles('HospitalAdmin', 'SuperAdmin'), activateCamp);

/**
 * @swagger
 * /camps/{id}/complete:
 *   put:
 *     summary: Mark a camp as Completed (Active -> Completed)
 *     tags: [Camps]
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
 *         description: Camp marked completed
 *       400:
 *         description: Only Active camps can be marked Completed
 *       404:
 *         description: Camp not found
 */
router.put('/:id/complete', protect, authorizeRoles('HospitalAdmin', 'SuperAdmin'), completeCamp);

/**
 * @swagger
 * /camps/{id}/cancel:
 *   put:
 *     summary: Cancel a camp
 *     tags: [Camps]
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
 *         description: Camp cancelled
 *       404:
 *         description: Camp not found
 */
router.put('/:id/cancel', protect, authorizeRoles('HospitalAdmin', 'SuperAdmin'), cancelCamp);

module.exports = router;