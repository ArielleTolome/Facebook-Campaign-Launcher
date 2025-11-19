# Budget Monitoring Service Documentation

## Overview

The Budget Monitoring Service is a real-time budget tracking and alerting system for Facebook ad campaigns. It automatically monitors campaign spending, detects budget anomalies, and can auto-pause campaigns that exceed budget thresholds.

## Features

### Core Functionality
- ✅ **Real-time Budget Tracking**: Monitors all active campaigns every 15 minutes
- ✅ **Spending Pace Detection**: Identifies campaigns spending >120% of expected pace
- ✅ **Auto-Pause at Threshold**: Automatically pauses campaigns at 90% budget spent
- ✅ **Spend Forecasting**: Predicts end-of-day/campaign spend based on current pace
- ✅ **Alert History**: Stores all alerts in database with full audit trail
- ✅ **Multiple Budget Types**: Supports both daily and lifetime budgets
- ✅ **Configurable Thresholds**: Easily adjust warning and critical thresholds

### Alert Types
- **OVERSPEND**: Campaign spending >120% of expected pace
- **UNDERSPEND**: Campaign spending <50% of expected pace
- **AUTO_PAUSED**: Campaign automatically paused at 90% budget
- **BUDGET_EXHAUSTED**: Campaign reached 95%+ of budget (critical warning)

### Severity Levels
- **INFO**: Informational alerts (e.g., underspending)
- **WARNING**: Potential issues requiring attention (e.g., overspending)
- **CRITICAL**: Urgent issues (e.g., budget exhausted, auto-paused)

## Architecture

### Components

#### 1. BudgetAlert Model (`src/models/BudgetAlert.js`)
Database model for storing budget alerts with the following fields:
- `id`: Unique identifier (UUID)
- `campaignId`: Reference to the campaign
- `alertType`: Type of alert (OVERSPEND, UNDERSPEND, AUTO_PAUSED, BUDGET_EXHAUSTED)
- `severity`: Alert severity (INFO, WARNING, CRITICAL)
- `message`: Human-readable alert description
- `currentSpend`: Actual spend amount
- `budgetLimit`: Budget limit
- `pacePercentage`: Spending pace as percentage
- `forecastedSpend`: Predicted total spend
- `status`: Alert status (ACTIVE, RESOLVED, ACKNOWLEDGED)
- `resolvedAt`: When alert was resolved
- `metadata`: Additional context (JSONB)

#### 2. BudgetMonitorService (`src/services/BudgetMonitorService.js`)
Core business logic for budget monitoring:

**Key Methods:**
- `monitorAllCampaigns()`: Main method to check all active campaigns
- `monitorCampaign(campaign)`: Monitor a single campaign
- `calculateDailyBudgetMetrics(campaign, currentSpend)`: Calculate metrics for daily budget campaigns
- `calculateLifetimeBudgetMetrics(campaign, currentSpend)`: Calculate metrics for lifetime budget campaigns
- `checkBudgetThresholds(campaign, metrics)`: Check if any thresholds are exceeded
- `createAlert(campaign, alertData, metrics)`: Create an alert in the database
- `pauseCampaign(campaign)`: Auto-pause a campaign
- `getCampaignAlerts(campaignId)`: Get alerts for a specific campaign
- `resolveAlert(alertId)`: Resolve an active alert
- `getMonitoringStats()`: Get overall monitoring statistics

**Configurable Thresholds:**
```javascript
OVERSPEND_THRESHOLD: 120    // Alert when >120% of expected pace
UNDERSPEND_THRESHOLD: 50    // Alert when <50% of expected pace
AUTO_PAUSE_THRESHOLD: 90    // Auto-pause at 90% of budget
CRITICAL_THRESHOLD: 95      // Critical alert at 95% of budget
```

#### 3. Budget Pacing Checker Job (`src/jobs/budgetPacingChecker.js`)
Scheduled job using node-cron:

**Schedule**: Every 15 minutes (`*/15 * * * *`)

**Features:**
- Prevents concurrent runs
- Comprehensive logging of results
- Error handling without crashing
- Manual trigger capability
- Status reporting

**Methods:**
- `start()`: Start the scheduled job
- `stop()`: Stop the scheduled job
- `runCheck()`: Execute a monitoring check
- `triggerManualCheck()`: Manually trigger a check
- `getStatus()`: Get job status and statistics

#### 4. API Routes (`src/routes/budgetMonitoring.js`)
RESTful API endpoints for budget monitoring:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/budget-monitoring/alerts` | Get all alerts with filtering |
| GET | `/api/budget-monitoring/campaigns/:campaignId/alerts` | Get alerts for specific campaign |
| GET | `/api/budget-monitoring/stats` | Get monitoring statistics |
| POST | `/api/budget-monitoring/check` | Manually trigger budget check |
| PUT | `/api/budget-monitoring/alerts/:alertId/resolve` | Resolve an alert |
| GET | `/api/budget-monitoring/job/status` | Get job status |
| GET | `/api/budget-monitoring/alerts/:alertId` | Get specific alert details |

## How It Works

### Daily Budget Monitoring

1. **Calculate Day Progress**: Determine how far through the day we are
   ```javascript
   dayProgress = minutesElapsed / totalMinutesInDay
   ```

2. **Calculate Expected Spend**: Based on time of day
   ```javascript
   expectedSpend = dailyBudget * dayProgress
   ```

3. **Calculate Pace**: Compare actual to expected
   ```javascript
   pacePercentage = (currentSpend / expectedSpend) * 100
   ```

4. **Forecast End-of-Day Spend**: Project total spend
   ```javascript
   forecastedSpend = currentSpend / dayProgress
   ```

### Lifetime Budget Monitoring

1. **Calculate Campaign Progress**: Determine campaign timeline progress
   ```javascript
   campaignProgress = (now - startTime) / (endTime - startTime)
   ```

2. **Calculate Expected Spend**: Based on campaign progress
   ```javascript
   expectedSpend = lifetimeBudget * campaignProgress
   ```

3. **Calculate Pace**: Compare actual to expected
   ```javascript
   pacePercentage = (currentSpend / expectedSpend) * 100
   ```

4. **Forecast Total Spend**: Project final spend
   ```javascript
   forecastedSpend = currentSpend / campaignProgress
   ```

### Alert Triggers

```javascript
// Auto-pause at 90%
if (spendPercentage >= 90) {
  pauseCampaign();
  createAlert('AUTO_PAUSED', 'CRITICAL');
}

// Critical warning at 95%
else if (spendPercentage >= 95) {
  createAlert('BUDGET_EXHAUSTED', 'CRITICAL');
}

// Warning at >120% pace
else if (pacePercentage >= 120) {
  createAlert('OVERSPEND', 'WARNING');
}

// Info at <50% pace
else if (pacePercentage <= 50) {
  createAlert('UNDERSPEND', 'INFO');
}
```

## API Usage Examples

### Get All Active Alerts
```bash
GET /api/budget-monitoring/alerts?status=ACTIVE&limit=20
```

Response:
```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "id": "uuid",
        "campaignId": "uuid",
        "alertType": "OVERSPEND",
        "severity": "WARNING",
        "message": "Campaign spending 125.3% of expected pace...",
        "currentSpend": "150.00",
        "budgetLimit": "200.00",
        "pacePercentage": "125.30",
        "forecastedSpend": "240.00",
        "status": "ACTIVE",
        "createdAt": "2025-11-19T10:00:00Z"
      }
    ],
    "pagination": {
      "total": 15,
      "limit": 20,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

### Get Campaign Alerts
```bash
GET /api/budget-monitoring/campaigns/{campaignId}/alerts?includeResolved=true
```

### Get Monitoring Statistics
```bash
GET /api/budget-monitoring/stats
```

Response:
```json
{
  "success": true,
  "data": {
    "totalAlerts": 42,
    "activeAlerts": 8,
    "criticalAlerts": 2,
    "alertsByType": [
      { "alertType": "OVERSPEND", "count": 5 },
      { "alertType": "AUTO_PAUSED", "count": 2 },
      { "alertType": "UNDERSPEND", "count": 1 }
    ]
  }
}
```

### Manually Trigger Check
```bash
POST /api/budget-monitoring/check
```

Response:
```json
{
  "success": true,
  "message": "Budget monitoring check completed",
  "data": {
    "monitored": 25,
    "alerts": [...],
    "paused": ["uuid1", "uuid2"],
    "errors": []
  }
}
```

### Resolve Alert
```bash
PUT /api/budget-monitoring/alerts/{alertId}/resolve
```

### Get Job Status
```bash
GET /api/budget-monitoring/job/status
```

Response:
```json
{
  "success": true,
  "data": {
    "isScheduled": true,
    "isRunning": false,
    "lastRun": "2025-11-19T10:00:00Z",
    "runCount": 96,
    "schedule": "*/15 * * * *",
    "nextRun": "2025-11-19T10:15:00Z"
  }
}
```

## Configuration

### Adjusting Thresholds

Edit `src/services/BudgetMonitorService.js`:

```javascript
constructor() {
  this.OVERSPEND_THRESHOLD = 120;      // Change to adjust overspend warning
  this.UNDERSPEND_THRESHOLD = 50;      // Change to adjust underspend warning
  this.AUTO_PAUSE_THRESHOLD = 90;      // Change to adjust auto-pause trigger
  this.CRITICAL_THRESHOLD = 95;        // Change to adjust critical alert
}
```

### Adjusting Schedule

Edit `src/jobs/budgetPacingChecker.js`:

```javascript
this.schedule = '*/15 * * * *'; // Every 15 minutes

// Other schedule examples:
// '*/5 * * * *'   // Every 5 minutes
// '*/30 * * * *'  // Every 30 minutes
// '0 * * * *'     // Every hour
```

### Timezone Configuration

Edit `src/jobs/budgetPacingChecker.js`:

```javascript
this.task = cron.schedule(this.schedule, async () => {
  await this.runCheck();
}, {
  scheduled: true,
  timezone: 'America/New_York' // Change timezone here
});
```

## Database Schema

### BudgetAlerts Table

```sql
CREATE TABLE budget_alerts (
  id UUID PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES campaigns(id),
  alert_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  current_spend DECIMAL(10,2) NOT NULL,
  budget_limit DECIMAL(10,2) NOT NULL,
  pace_percentage DECIMAL(5,2),
  forecasted_spend DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'ACTIVE',
  resolved_at TIMESTAMP,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_budget_alerts_campaign_id ON budget_alerts(campaign_id);
CREATE INDEX idx_budget_alerts_status ON budget_alerts(status);
CREATE INDEX idx_budget_alerts_alert_type ON budget_alerts(alert_type);
CREATE INDEX idx_budget_alerts_created_at ON budget_alerts(created_at);
```

## Logs and Monitoring

### Log Format

The service provides detailed console logs:

```
[BudgetMonitor] Starting budget monitoring check...
[BudgetMonitor] Found 25 active campaigns to monitor

--- Budget Monitoring Results ---
Campaigns monitored: 25
Alerts created: 3
Campaigns paused: 1
Errors: 0

--- Alerts ---
1. [WARNING] Campaign spending 125.3% of expected pace...
   Campaign ID: abc-123
   Type: OVERSPEND
   Spend: $150.00 / $200.00
   Pace: 125.3%

2. [CRITICAL] Campaign auto-paused: 91.2% of daily budget spent
   Campaign ID: def-456
   Type: AUTO_PAUSED
   Spend: $182.40 / $200.00
   Pace: 145.6%
```

## Success Criteria ✅

- ✅ **Detects campaigns spending >120% daily pace**: Implemented with configurable threshold
- ✅ **Automatically pauses campaigns at threshold**: Auto-pauses at 90% budget spent
- ✅ **Stores alert history in database**: All alerts stored in `budget_alerts` table with full metadata

## Dependencies

- `node-cron`: ^3.0.3 - For scheduled job execution
- `sequelize`: For database operations
- `express`: For API routes

## Testing

### Manual Test Scenarios

1. **Test Overspending Detection**:
   - Create a campaign with low daily budget ($10)
   - Wait for Facebook spend to exceed 120% of expected pace
   - Verify alert is created

2. **Test Auto-Pause**:
   - Create a campaign with low daily budget
   - Let it spend to 90%+ of budget
   - Verify campaign is automatically paused
   - Verify alert is created with type AUTO_PAUSED

3. **Test API Endpoints**:
   ```bash
   # Get job status
   curl http://localhost:5000/api/budget-monitoring/job/status

   # Trigger manual check
   curl -X POST http://localhost:5000/api/budget-monitoring/check

   # Get alerts
   curl http://localhost:5000/api/budget-monitoring/alerts

   # Get stats
   curl http://localhost:5000/api/budget-monitoring/stats
   ```

## Future Enhancements

- Email/SMS notifications for critical alerts
- Webhook support for external integrations
- Dashboard UI for visualizing budget trends
- Machine learning for more accurate spend forecasting
- Support for ad set level budget monitoring
- Configurable alert rules per campaign
- Budget pacing recommendations
- Historical spend analysis and reporting

## Troubleshooting

### Job Not Running
- Check server logs for "Starting budget monitoring service..."
- Verify node-cron is installed: `npm list node-cron`
- Check job status: `GET /api/budget-monitoring/job/status`

### No Alerts Created
- Verify campaigns have `fbCampaignId` set
- Verify campaigns have `dailyBudget` or `lifetimeBudget` set
- Check if campaigns are ACTIVE status
- Verify Facebook API credentials are valid
- Check server logs for errors during monitoring

### Campaigns Not Auto-Pausing
- Verify Facebook API access token has permission to update campaigns
- Check error logs for API failures
- Verify campaign `fbCampaignId` matches Facebook campaign ID

## Support

For issues or questions, check:
1. Server logs for detailed error messages
2. Job status endpoint for monitoring health
3. Database `budget_alerts` table for alert history
4. Facebook API error responses in logs
