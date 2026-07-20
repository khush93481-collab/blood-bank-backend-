exports.authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Access denied. Role '${req.user ? req.user.role : 'unknown'}' is not authorized for this action.`,
    });
  }
  next();
};