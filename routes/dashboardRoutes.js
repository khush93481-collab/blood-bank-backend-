const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getCampParticipationStats,
  getCampSummaryReport,
  getDonorReport,
  getBloodGroupDistribution,
  getEmergencyRequestReport,
  getVolunteerAssignmentReport,
  getMonthlyDonationReport,
} = require('../controllers/dashboardController');
const { protect } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

/**
 * @swagger
 * tags:
 *   - name: Dashboard
 *     description: Dashboard summary statistics and reports
 */

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     summary: Get main dashboard summary statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */
router.get('/stats', protect, authorizeRoles('SuperAdmin', 'HospitalAdmin'), getDashboardStats);

/**
 * @swagger
 * /dashboard/camp-participation:
 *   get:
 *     summary: Get camp-wise participation statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Camp participation statistics
 */
router.get('/camp-participation', protect, authorizeRoles('SuperAdmin', 'HospitalAdmin'), getCampParticipationStats);

/**
 * @swagger
 * /dashboard/reports/camp-summary:
 *   get:
 *     summary: Camp Summary Report
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all camps with summary details
 */
router.get('/reports/camp-summary', protect, authorizeRoles('SuperAdmin', 'HospitalAdmin'), getCampSummaryReport);

/**
 * @swagger
 * /dashboard/reports/donors:
 *   get:
 *     summary: Donor Report
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all donors with details
 */
router.get('/reports/donors', protect, authorizeRoles('SuperAdmin', 'HospitalAdmin'), getDonorReport);

/**
 * @swagger
 * /dashboard/reports/blood-group-distribution:
 *   get:
 *     summary: Blood Group Distribution Report
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Count of donors grouped by blood group
 */
router.get('/reports/blood-group-distribution', protect, authorizeRoles('SuperAdmin', 'HospitalAdmin'), getBloodGroupDistribution);

/**
 * @swagger
 * /dashboard/reports/emergency-requests:
 *   get:
 *     summary: Emergency Request Report
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all emergency requests
 */
router.get('/reports/emergency-requests', protect, authorizeRoles('SuperAdmin', 'HospitalAdmin'), getEmergencyRequestReport);

/**
 * @swagger
 * /dashboard/reports/volunteer-assignments:
 *   get:
 *     summary: Volunteer Assignment Report
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all volunteer assignments
 */
router.get('/reports/volunteer-assignments', protect, authorizeRoles('SuperAdmin', 'HospitalAdmin'), getVolunteerAssignmentReport);

/**
 * @swagger
 * /dashboard/reports/monthly-donations:
 *   get:
 *     summary: Monthly Donation Report
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Donations grouped by month
 */
router.get('/reports/monthly-donations', protect, authorizeRoles('SuperAdmin', 'HospitalAdmin'), getMonthlyDonationReport);

module.exports = router;