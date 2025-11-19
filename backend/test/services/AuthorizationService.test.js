const assert = require('assert');
const { ROLES, hasPermission } = require('../../src/services/AuthorizationService');

describe('AuthorizationService', () => {
  it('should allow Admin to do everything', () => {
    assert.strictEqual(hasPermission(ROLES.ADMIN, 'READ'), true);
    assert.strictEqual(hasPermission(ROLES.ADMIN, 'WRITE'), true);
    assert.strictEqual(hasPermission(ROLES.ADMIN, 'DELETE'), true);
  });

  it('should allow Viewer to only read', () => {
    assert.strictEqual(hasPermission(ROLES.VIEWER, 'READ'), true);
    assert.strictEqual(hasPermission(ROLES.VIEWER, 'WRITE'), false);
    assert.strictEqual(hasPermission(ROLES.VIEWER, 'DELETE'), false);
  });

  it('should allow Campaign Manager to read and write', () => {
    assert.strictEqual(hasPermission(ROLES.CAMPAIGN_MANAGER, 'READ'), true);
    assert.strictEqual(hasPermission(ROLES.CAMPAIGN_MANAGER, 'WRITE'), true);
    assert.strictEqual(hasPermission(ROLES.CAMPAIGN_MANAGER, 'DELETE'), false);
  });
});
