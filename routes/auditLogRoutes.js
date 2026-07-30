const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditLogController');
const { protect } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

/**
 * @swagger
 * tags:
 *   - name: Audit Logs
 *     description: System activity logs for accountability and traceability
 */

/**
 * @swagger
 * /audit-logs:
 *   get:
 *     summary: Get audit logs (SuperAdmin) with optional filters
 *     tags: [Audit Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: module
 *         schema:
 *           type: string
 *         description: Filter by module name (e.g. Camps, Donors, Users)
 *       - in: query
 *         name: userRole
 *         schema:
 *           type: string
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of audit logs
 */
router.get('/', protect, authorizeRoles('SuperAdmin'), getAuditLogs);

module.exports = router;