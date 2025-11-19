const ROLES = {
  ADMIN: 'Admin',
  VIEWER: 'Viewer',
  CAMPAIGN_MANAGER: 'Campaign Manager',
};

const PERMISSIONS = {
  READ: [ROLES.ADMIN, ROLES.VIEWER, ROLES.CAMPAIGN_MANAGER],
  WRITE: [ROLES.ADMIN, ROLES.CAMPAIGN_MANAGER],
  DELETE: [ROLES.ADMIN],
};

function hasPermission(userRole, requiredPermission) {
  return PERMISSIONS[requiredPermission]?.includes(userRole);
}

module.exports = {
  ROLES,
  PERMISSIONS,
  hasPermission,
};
