const { hasPermission } = require('../services/AuthorizationService');
const { logAction } = require('../services/LogService');

function rbacMiddleware(requiredPermission) {
  return (req, res, next) => {
    const user = req.user;

    if (!user || !hasPermission(user.role, requiredPermission)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    logAction(user.id, `${requiredPermission} action on ${req.originalUrl}`);
    next();
  };
}

module.exports = rbacMiddleware;
