const AuditLog = require('../models/auditLogModel');

// Call this from any controller to record an action
const logAction = async ({ user, action, module, ipAddress, remarks }) => {
  try {
    await AuditLog.create({
      user: user?._id || user?.id || null,
      userName: user?.name || 'Unknown',
      userRole: user?.role || 'Unknown',
      action,
      module,
      ipAddress: ipAddress || '',
      remarks: remarks || '',
    });
  } catch (error) {
    console.error('Failed to write audit log:', error.message);
  }
};

module.exports = { logAction };