# Notification System Documentation

## Overview

The Notification System is a multi-channel notification hub for the Facebook Campaign Launcher. It supports email, webhooks, and Slack notifications, allowing users to receive alerts about campaign events, budget thresholds, and errors.

## Features

- **Multi-Channel Support**
  - Email notifications (SendGrid, AWS SES, SMTP)
  - Webhook notifications (POST to custom URLs)
  - Slack notifications (via webhooks)

- **Flexible Notification Preferences**
  - Per-user notification settings
  - Granular control over notification types
  - Custom budget alert thresholds
  - Quiet hours support

- **Event Types**
  - Budget alerts (when spending reaches thresholds)
  - Campaign completion notifications
  - Campaign error notifications
  - A/B test results (when available)

## Architecture

### Components

1. **NotificationPreference Model** (`models/NotificationPreference.js`)
   - Stores user notification preferences
   - Configures channel settings (email, webhook, Slack)
   - Defines notification triggers and thresholds

2. **NotificationService** (`services/NotificationService.js`)
   - Core notification logic
   - Handles sending to multiple channels
   - Formats messages for each channel
   - Manages quiet hours and preferences

3. **NotificationController** (`controllers/notificationController.js`)
   - API endpoint handlers
   - CRUD operations for preferences
   - Manual notification triggering

4. **Integration Utilities** (`utils/budgetAlertIntegration.js`)
   - Helper functions for budget monitoring
   - Campaign event handlers
   - Integration examples for Agent 1 (Budget Alert System)

## API Endpoints

### Notification Preferences

#### Create Preferences
```http
POST /api/notifications/preferences
Content-Type: application/json

{
  "userId": "user-uuid",
  "emailEnabled": true,
  "emailAddress": "user@example.com",
  "webhookEnabled": true,
  "webhookUrl": "https://your-webhook.com/endpoint",
  "slackEnabled": false,
  "notifyOnBudgetAlert": true,
  "budgetAlertThresholds": [75, 90, 100]
}
```

#### Get User Preferences
```http
GET /api/notifications/users/:userId/preferences
```

#### Update User Preferences
```http
PUT /api/notifications/users/:userId/preferences
Content-Type: application/json

{
  "emailEnabled": false,
  "slackEnabled": true,
  "slackWebhookUrl": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
}
```

#### Get All Preferences
```http
GET /api/notifications/preferences
```

#### Delete Preferences
```http
DELETE /api/notifications/preferences/:id
```

### Sending Notifications

#### Send Generic Notification
```http
POST /api/notifications/send
Content-Type: application/json

{
  "userId": "user-uuid",
  "notification": {
    "type": "custom",
    "subject": "Test Notification",
    "message": "This is a test message",
    "data": {
      "customField": "customValue"
    }
  }
}
```

#### Send Budget Alert
```http
POST /api/notifications/send/budget-alert
Content-Type: application/json

{
  "userId": "user-uuid",
  "alertData": {
    "campaignId": "campaign-uuid",
    "campaignName": "My Campaign",
    "budget": "1000.00",
    "currentSpend": "750.00",
    "percentage": 75
  }
}
```

#### Send Campaign Complete Notification
```http
POST /api/notifications/send/campaign-complete
Content-Type: application/json

{
  "userId": "user-uuid",
  "campaignData": {
    "campaignId": "campaign-uuid",
    "campaignName": "My Campaign",
    "totalSpend": "1000.00",
    "results": {
      "impressions": 10000,
      "clicks": 500,
      "conversions": 50
    }
  }
}
```

#### Send Campaign Error Notification
```http
POST /api/notifications/send/campaign-error
Content-Type: application/json

{
  "userId": "user-uuid",
  "errorData": {
    "campaignId": "campaign-uuid",
    "campaignName": "My Campaign",
    "error": "API rate limit exceeded",
    "details": "Error stack trace here"
  }
}
```

#### Test Notification Configuration
```http
POST /api/notifications/test/:userId
```

## Configuration

### Environment Variables

Add the following to your `.env` file:

```env
# Notification Service Configuration
EMAIL_SERVICE=smtp  # Options: 'sendgrid', 'ses', 'smtp'
EMAIL_FROM=noreply@campaign-launcher.com

# SendGrid Configuration
SENDGRID_API_KEY=your_sendgrid_api_key

# AWS SES Configuration
AWS_SES_HOST=email-smtp.us-east-1.amazonaws.com
AWS_SES_ACCESS_KEY=your_aws_ses_access_key
AWS_SES_SECRET_KEY=your_aws_ses_secret_key

# SMTP Configuration
SMTP_HOST=localhost
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASSWORD=
```

### Email Service Setup

#### Using SendGrid
1. Sign up for SendGrid account
2. Generate an API key
3. Set `EMAIL_SERVICE=sendgrid` and `SENDGRID_API_KEY=your_key`

#### Using AWS SES
1. Set up AWS SES and verify domains/emails
2. Create SMTP credentials
3. Set `EMAIL_SERVICE=ses` and configure AWS credentials

#### Using Generic SMTP
1. Configure your SMTP server details
2. Set `EMAIL_SERVICE=smtp` and provide SMTP settings

### Webhook Setup

Webhooks send POST requests with JSON payload:

```json
{
  "timestamp": "2024-01-15T12:00:00.000Z",
  "type": "budget_alert",
  "subject": "Budget Alert: My Campaign",
  "message": "Campaign has reached 75% of budget",
  "data": {
    "campaignId": "...",
    "campaignName": "...",
    "budget": "1000.00",
    "currentSpend": "750.00",
    "percentage": 75
  }
}
```

Custom headers can be configured via the `webhookHeaders` field in preferences.

### Slack Setup

1. Create a Slack Incoming Webhook:
   - Go to https://api.slack.com/apps
   - Create a new app
   - Enable Incoming Webhooks
   - Copy the webhook URL

2. Configure in preferences:
```json
{
  "slackEnabled": true,
  "slackWebhookUrl": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL",
  "slackChannel": "#alerts"  // Optional
}
```

## Integration with Budget Alert System (Agent 1)

The notification system is designed to integrate seamlessly with the budget alert system. Here's how to use it:

### Example: Budget Monitoring

```javascript
const { checkBudgetAndNotify, monitorCampaignBudgets } = require('./utils/budgetAlertIntegration');
const { Campaign } = require('./models');

// Monitor a single campaign
async function checkCampaign(campaignId, userId) {
  const campaign = await Campaign.findByPk(campaignId);
  const result = await checkBudgetAndNotify(campaign, userId);
  return result;
}

// Monitor all active campaigns (e.g., in a cron job)
async function monitorAllCampaigns(userId) {
  const campaigns = await Campaign.findAll({
    where: { status: 'ACTIVE' }
  });
  const results = await monitorCampaignBudgets(campaigns, userId);
  console.log(`Checked ${results.checked} campaigns, sent ${results.alerted} alerts`);
}
```

### Example: Campaign Events

```javascript
const { notifyCampaignComplete, notifyCampaignError } = require('./utils/budgetAlertIntegration');

// When a campaign completes
async function onCampaignComplete(campaign, userId) {
  const results = {
    totalSpend: 1000,
    impressions: 10000,
    clicks: 500,
    conversions: 50,
    ctr: 5.0,
    cpc: 2.0
  };

  await notifyCampaignComplete(campaign, results, userId);
}

// When a campaign encounters an error
async function onCampaignError(campaign, error, userId) {
  await notifyCampaignError(campaign, error, userId);
}
```

## Notification Preference Options

### Full Schema

```javascript
{
  // User identification
  userId: "uuid",

  // Email settings
  emailEnabled: true,
  emailAddress: "user@example.com",

  // Webhook settings
  webhookEnabled: true,
  webhookUrl: "https://your-webhook.com/endpoint",
  webhookHeaders: {
    "Authorization": "Bearer token",
    "Custom-Header": "value"
  },

  // Slack settings
  slackEnabled: true,
  slackWebhookUrl: "https://hooks.slack.com/services/...",
  slackChannel: "#alerts",

  // Notification triggers
  notifyOnBudgetAlert: true,
  notifyOnCampaignComplete: true,
  notifyOnCampaignError: true,
  notifyOnABTestResults: false,

  // Budget alert configuration
  budgetAlertThresholds: [75, 90, 100],  // Percentages

  // Quiet hours
  quietHoursEnabled: true,
  quietHoursStart: "22:00",
  quietHoursEnd: "08:00",
  timezone: "America/New_York"
}
```

## Testing

### Test Notification Configuration

Send a test notification to verify your setup:

```bash
curl -X POST http://localhost:5000/api/notifications/test/user-uuid
```

This will send a test notification to all enabled channels for the specified user.

### Manual Notification Testing

```bash
# Create preferences
curl -X POST http://localhost:5000/api/notifications/preferences \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "emailEnabled": true,
    "emailAddress": "test@example.com"
  }'

# Send test notification
curl -X POST http://localhost:5000/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "notification": {
      "type": "test",
      "subject": "Test",
      "message": "This is a test"
    }
  }'
```

## Database Schema

The `notification_preferences` table is automatically created with the following structure:

```sql
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  email_enabled BOOLEAN DEFAULT true,
  email_address VARCHAR(255),
  webhook_enabled BOOLEAN DEFAULT false,
  webhook_url VARCHAR(255),
  webhook_headers JSONB DEFAULT '{}',
  slack_enabled BOOLEAN DEFAULT false,
  slack_webhook_url VARCHAR(255),
  slack_channel VARCHAR(255),
  notify_on_budget_alert BOOLEAN DEFAULT true,
  notify_on_campaign_complete BOOLEAN DEFAULT true,
  notify_on_campaign_error BOOLEAN DEFAULT true,
  notify_on_ab_test_results BOOLEAN DEFAULT false,
  budget_alert_thresholds JSONB DEFAULT '[75, 90, 100]',
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  timezone VARCHAR(255) DEFAULT 'UTC',
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);
```

## Error Handling

The notification service handles errors gracefully:

- Failed email sends are logged but don't block other channels
- Webhook timeouts (10 seconds) prevent hanging requests
- All channels are attempted in parallel
- Results include success/failure status for each channel

Example response:

```json
{
  "success": true,
  "results": {
    "email": { "success": true, "messageId": "..." },
    "webhook": { "success": false, "error": "Connection timeout" },
    "slack": { "success": true }
  }
}
```

## Future Enhancements

- SMS notifications (Twilio integration)
- Push notifications (mobile apps)
- In-app notification center
- Notification history/logs
- Delivery status tracking
- Rate limiting per user
- Template customization
- Multi-language support

## Support

For issues or questions about the notification system, please refer to the main project documentation or create an issue in the repository.
