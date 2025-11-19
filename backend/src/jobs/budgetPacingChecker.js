const cron = require('node-cron');
const budgetMonitorService = require('../services/BudgetMonitorService');

class BudgetPacingChecker {
  constructor() {
    this.task = null;
    this.isRunning = false;
    this.lastRun = null;
    this.runCount = 0;
    this.schedule = '*/15 * * * *'; // Every 15 minutes
  }

  /**
   * Start the scheduled job
   */
  start() {
    if (this.task) {
      console.log('[BudgetPacingChecker] Job is already running');
      return;
    }

    console.log('[BudgetPacingChecker] Starting budget pacing checker job (every 15 minutes)');

    // Create cron job that runs every 15 minutes
    this.task = cron.schedule(this.schedule, async () => {
      await this.runCheck();
    }, {
      scheduled: true,
      timezone: 'America/New_York' // Adjust timezone as needed
    });

    console.log('[BudgetPacingChecker] Job scheduled successfully');

    // Run initial check immediately on startup
    this.runCheck();
  }

  /**
   * Stop the scheduled job
   */
  stop() {
    if (this.task) {
      this.task.stop();
      this.task = null;
      console.log('[BudgetPacingChecker] Job stopped');
    }
  }

  /**
   * Execute the budget monitoring check
   */
  async runCheck() {
    // Prevent concurrent runs
    if (this.isRunning) {
      console.log('[BudgetPacingChecker] Previous check still running, skipping this interval');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      console.log('\n========================================');
      console.log(`[BudgetPacingChecker] Running check #${this.runCount + 1} at ${new Date().toISOString()}`);
      console.log('========================================\n');

      // Run the budget monitoring service
      const results = await budgetMonitorService.monitorAllCampaigns();

      // Log results
      this.logResults(results);

      // Update job stats
      this.lastRun = new Date();
      this.runCount++;

      const duration = Date.now() - startTime;
      console.log(`\n[BudgetPacingChecker] Check completed in ${duration}ms`);

      return results;
    } catch (error) {
      console.error('[BudgetPacingChecker] Error during budget check:', error);

      // Log error but don't crash the job
      this.logError(error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Log monitoring results
   */
  logResults(results) {
    console.log('\n--- Budget Monitoring Results ---');
    console.log(`Campaigns monitored: ${results.monitored}`);
    console.log(`Alerts created: ${results.alerts.length}`);
    console.log(`Campaigns paused: ${results.paused.length}`);
    console.log(`Errors: ${results.errors.length}`);

    if (results.alerts.length > 0) {
      console.log('\n--- Alerts ---');
      results.alerts.forEach((alert, index) => {
        console.log(`${index + 1}. [${alert.severity}] ${alert.message}`);
        console.log(`   Campaign ID: ${alert.campaignId}`);
        console.log(`   Type: ${alert.alertType}`);
        console.log(`   Spend: $${alert.currentSpend} / $${alert.budgetLimit}`);
        console.log(`   Pace: ${alert.pacePercentage?.toFixed(1)}%`);
      });
    }

    if (results.paused.length > 0) {
      console.log('\n--- Auto-Paused Campaigns ---');
      results.paused.forEach((campaignId, index) => {
        console.log(`${index + 1}. Campaign ID: ${campaignId}`);
      });
    }

    if (results.errors.length > 0) {
      console.log('\n--- Errors ---');
      results.errors.forEach((error, index) => {
        console.log(`${index + 1}. Campaign ID: ${error.campaignId}`);
        console.log(`   Error: ${error.error}`);
      });
    }

    console.log('----------------------------\n');
  }

  /**
   * Log error details
   */
  logError(error) {
    console.error('\n--- Error Details ---');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('--------------------\n');
  }

  /**
   * Get job status
   */
  getStatus() {
    return {
      isScheduled: this.task !== null,
      isRunning: this.isRunning,
      lastRun: this.lastRun,
      runCount: this.runCount,
      schedule: this.schedule,
      nextRun: this.task ? this.getNextRunTime() : null
    };
  }

  /**
   * Calculate next run time
   */
  getNextRunTime() {
    if (!this.lastRun) {
      return 'Pending first run';
    }

    const next = new Date(this.lastRun);
    next.setMinutes(next.getMinutes() + 15);
    return next.toISOString();
  }

  /**
   * Manually trigger a check (for testing or on-demand)
   */
  async triggerManualCheck() {
    console.log('[BudgetPacingChecker] Manual check triggered');
    return await this.runCheck();
  }
}

// Export singleton instance
module.exports = new BudgetPacingChecker();
