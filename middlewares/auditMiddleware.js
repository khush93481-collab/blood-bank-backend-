const { logAction } = require('../utils/auditLogger');

// Maps HTTP method + route pattern to a human-readable action + module
const auditLogger = (moduleName) => {
  return (req, res, next) => {
    // Capture the original res.json to log AFTER the action succeeds
    const originalJson = res.json.bind(res);

    res.json = (body) => {
      // Only log successful actions (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const actionMap = {
          POST: 'Create',
          PUT: 'Update',
          DELETE: 'Delete',
          GET: 'View',
        };
        const action = `${actionMap[req.method] || req.method} ${moduleName}`;

        logAction({
          user: req.user,
          action,
          module: moduleName,
          ipAddress: req.ip,
          remarks: `${req.method} ${req.originalUrl}`,
        });
      }
      return originalJson(body);
    };

    next();
  };
};

module.exports = auditLogger;