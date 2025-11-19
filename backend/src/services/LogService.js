function logAction(userId, action) {
  console.log(`[AUDIT] User ${userId} performed action: ${action} at ${new Date().toISOString()}`);
}

module.exports = {
  logAction,
};
