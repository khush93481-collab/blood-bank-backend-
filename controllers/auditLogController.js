const AuditLog = require('../models/auditLogModel');

// Get all audit logs (SuperAdmin) - with optional filters
exports.getAuditLogs = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.module) filter.module = req.query.module;
    if (req.query.userRole) filter.userRole = req.query.userRole;
    if (req.query.action) filter.action = { $regex: req.query.action, $options: 'i' };

    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(500); // cap to avoid huge responses

    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    next(error);
  }
};