# Facebook Campaign Launcher API Documentation

## Base URL

```
http://localhost:5000/api
```

## Authentication

Currently, the API does not require authentication for local development. In production, implement appropriate authentication mechanisms.

## Response Format

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

## Endpoints

### Health Check

#### GET /health

Check if the API server is running.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Campaign Endpoints

### GET /campaigns

Get all campaigns with optional filtering.

**Query Parameters:**
- `status` (optional): Filter by status (ACTIVE, PAUSED, DELETED, ARCHIVED)
- `isTemplate` (optional): Filter templates (true/false)

**Example:**
```bash
GET /campaigns?status=ACTIVE&isTemplate=false
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Summer Campaign",
      "objective": "LINK_CLICKS",
      "status": "ACTIVE",
      "dailyBudget": "50.00",
      "lifetimeBudget": null,
      "isTemplate": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /campaigns/:id

Get a specific campaign by ID including ad sets and A/B tests.

**Parameters:**
- `id`: Campaign UUID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Summer Campaign",
    "objective": "LINK_CLICKS",
    "status": "ACTIVE",
    "adSets": [],
    "abTests": []
  }
}
```

### POST /campaigns

Create a new campaign.

**Query Parameters:**
- `adAccountId` (optional): Facebook Ad Account ID for syncing

**Request Body:**
```json
{
  "name": "New Campaign",
  "objective": "CONVERSIONS",
  "dailyBudget": 100.00,
  "lifetimeBudget": 1000.00,
  "status": "PAUSED",
  "isTemplate": false,
  "startTime": "2024-01-01T00:00:00.000Z",
  "endTime": "2024-12-31T23:59:59.000Z",
  "metadata": {}
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "New Campaign",
    "fbCampaignId": "fb_campaign_id",
    ...
  }
}
```

### POST /campaigns/bulk

Bulk create multiple campaigns.

**Query Parameters:**
- `adAccountId` (optional): Facebook Ad Account ID

**Request Body:**
```json
{
  "campaigns": [
    {
      "name": "Campaign 1",
      "objective": "LINK_CLICKS",
      "dailyBudget": 50
    },
    {
      "name": "Campaign 2",
      "objective": "CONVERSIONS",
      "dailyBudget": 100
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "successful": [
      { "id": "uuid1", "name": "Campaign 1", ... }
    ],
    "failed": [
      {
        "data": { "name": "Campaign 2", ... },
        "error": "Error message"
      }
    ]
  }
}
```

### PUT /campaigns/:id

Update an existing campaign.

**Parameters:**
- `id`: Campaign UUID

**Request Body:**
```json
{
  "name": "Updated Campaign Name",
  "status": "ACTIVE",
  "dailyBudget": 75.00
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Updated Campaign Name",
    ...
  }
}
```

### DELETE /campaigns/:id

Soft delete a campaign (sets status to DELETED).

**Parameters:**
- `id`: Campaign UUID

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Campaign deleted successfully"
  }
}
```

### POST /campaigns/templates/:templateId/create

Create a campaign from a template.

**Parameters:**
- `templateId`: Template campaign UUID

**Query Parameters:**
- `adAccountId` (optional): Facebook Ad Account ID

**Request Body:**
```json
{
  "name": "Campaign from Template",
  "dailyBudget": 150.00,
  "startTime": "2024-01-01T00:00:00.000Z",
  "metadata": {
    "customField": "value"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Campaign from Template",
    "templateId": "template_uuid",
    ...
  }
}
```

### GET /campaigns/:id/insights

Get performance insights for a campaign from Facebook.

**Parameters:**
- `id`: Campaign UUID

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "impressions": "10000",
        "clicks": "500",
        "spend": "250.00",
        "ctr": "5.00",
        "cpc": "0.50",
        "cpm": "25.00",
        "actions": [],
        "cost_per_action_type": []
      }
    ]
  }
}
```

---

## Creative Endpoints

### GET /creatives

Get all creatives with optional filtering.

**Query Parameters:**
- `status` (optional): Filter by status (ACTIVE, ARCHIVED)
- `format` (optional): Filter by format

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Summer Sale Creative",
      "title": "Amazing Deals",
      "body": "Get 50% off",
      "imageUrl": "https://example.com/image.jpg",
      "linkUrl": "https://example.com",
      "callToAction": "SHOP_NOW",
      "status": "ACTIVE"
    }
  ]
}
```

### GET /creatives/:id

Get a specific creative by ID.

**Parameters:**
- `id`: Creative UUID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Summer Sale Creative",
    "ads": []
  }
}
```

### POST /creatives

Create a new creative.

**Query Parameters:**
- `adAccountId` (optional): Facebook Ad Account ID
- `pageId` (optional): Facebook Page ID (required for Facebook sync)

**Request Body:**
```json
{
  "name": "New Creative",
  "title": "Headline",
  "body": "Ad copy text",
  "imageUrl": "https://example.com/image.jpg",
  "videoUrl": "https://example.com/video.mp4",
  "linkUrl": "https://example.com/landing",
  "callToAction": "LEARN_MORE",
  "format": "SINGLE_IMAGE",
  "metadata": {}
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "New Creative",
    "fbCreativeId": "fb_creative_id",
    ...
  }
}
```

### POST /creatives/bulk

Bulk create multiple creatives.

**Query Parameters:**
- `adAccountId` (optional): Facebook Ad Account ID

**Request Body:**
```json
{
  "creatives": [
    {
      "name": "Creative 1",
      "title": "Title 1",
      "body": "Body 1"
    },
    {
      "name": "Creative 2",
      "title": "Title 2",
      "body": "Body 2"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "successful": [...],
    "failed": [...]
  }
}
```

### PUT /creatives/:id

Update a creative.

**Parameters:**
- `id`: Creative UUID

**Request Body:**
```json
{
  "title": "Updated Title",
  "body": "Updated body text"
}
```

### DELETE /creatives/:id

Archive a creative (soft delete).

**Parameters:**
- `id`: Creative UUID

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Creative archived successfully"
  }
}
```

---

## A/B Test Endpoints

### GET /ab-tests

Get all A/B tests with optional filtering.

**Query Parameters:**
- `campaignId` (optional): Filter by campaign
- `status` (optional): Filter by status (DRAFT, RUNNING, COMPLETED, ARCHIVED)
- `testType` (optional): Filter by type (CREATIVE, AUDIENCE, PLACEMENT, DELIVERY_OPTIMIZATION)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Creative A/B Test",
      "campaignId": "campaign_uuid",
      "testType": "CREATIVE",
      "status": "RUNNING",
      "variants": [],
      "results": {}
    }
  ]
}
```

### GET /ab-tests/:id

Get a specific A/B test by ID.

**Parameters:**
- `id`: A/B Test UUID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Creative A/B Test",
    "campaign": {...}
  }
}
```

### POST /ab-tests

Create a new A/B test.

**Request Body:**
```json
{
  "name": "New A/B Test",
  "campaignId": "campaign_uuid",
  "testType": "CREATIVE",
  "variants": [
    {
      "id": "variant_1",
      "name": "Variant A",
      "config": {}
    },
    {
      "id": "variant_2",
      "name": "Variant B",
      "config": {}
    }
  ],
  "winnerCriteria": "CTR"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "New A/B Test",
    "status": "DRAFT",
    ...
  }
}
```

### PUT /ab-tests/:id

Update an A/B test.

**Parameters:**
- `id`: A/B Test UUID

**Request Body:**
```json
{
  "name": "Updated Test Name",
  "variants": [...]
}
```

### POST /ab-tests/:id/start

Start an A/B test.

**Parameters:**
- `id`: A/B Test UUID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "RUNNING",
    "startDate": "2024-01-01T00:00:00.000Z"
  }
}
```

### POST /ab-tests/:id/complete

Complete an A/B test.

**Parameters:**
- `id`: A/B Test UUID

**Request Body:**
```json
{
  "results": {
    "winner": "variant_1",
    "metrics": {...}
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "COMPLETED",
    "endDate": "2024-01-01T00:00:00.000Z",
    "results": {...}
  }
}
```

### GET /ab-tests/:id/analyze

Analyze A/B test results.

**Parameters:**
- `id`: A/B Test UUID

**Response:**
```json
{
  "success": true,
  "data": {
    "testId": "uuid",
    "testType": "CREATIVE",
    "variants": [...],
    "winner": "variant_1",
    "metrics": {...}
  }
}
```

---

## Campaign Objectives

Supported Facebook campaign objectives:

- `LINK_CLICKS` - Drive traffic to website
- `CONVERSIONS` - Drive conversions on website
- `REACH` - Maximize reach
- `BRAND_AWARENESS` - Increase brand awareness
- `APP_INSTALLS` - Drive app installations
- `VIDEO_VIEWS` - Promote video views
- `LEAD_GENERATION` - Collect leads
- `MESSAGES` - Drive messages to business

## Call to Action Types

Supported call-to-action buttons:

- `LEARN_MORE`
- `SHOP_NOW`
- `SIGN_UP`
- `DOWNLOAD`
- `BOOK_TRAVEL`
- `CONTACT_US`
- `GET_QUOTE`
- `APPLY_NOW`
- `SUBSCRIBE`
- `WATCH_MORE`

## Error Codes

- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

The API implements rate limiting:
- 100 requests per 15 minutes per IP address
- Exceeding the limit returns HTTP 429 (Too Many Requests)

## Best Practices

1. **Batch Operations**: Use bulk endpoints when creating multiple items
2. **Pagination**: For large datasets, implement pagination on the client side
3. **Error Handling**: Always check the `success` field in responses
4. **Templates**: Use campaign templates for repeated campaign structures
5. **A/B Testing**: Run tests for at least 3-7 days for statistical significance
6. **Budget Management**: Monitor campaign spend through insights endpoint
7. **Status Management**: Pause campaigns before making major changes

## Automation Integration Examples

### Node.js Example

```javascript
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function createCampaign() {
  try {
    const response = await axios.post(`${API_URL}/campaigns`, {
      name: 'Automated Campaign',
      objective: 'CONVERSIONS',
      dailyBudget: 100,
      status: 'PAUSED'
    });
    console.log('Campaign created:', response.data);
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}

createCampaign();
```

### Python Example

```python
import requests

API_URL = 'http://localhost:5000/api'

def create_campaign():
    response = requests.post(f'{API_URL}/campaigns', json={
        'name': 'Automated Campaign',
        'objective': 'CONVERSIONS',
        'dailyBudget': 100,
        'status': 'PAUSED'
    })
    
    if response.json()['success']:
        print('Campaign created:', response.json()['data'])
    else:
        print('Error:', response.json()['error'])

create_campaign()
```

### cURL Example

```bash
curl -X POST http://localhost:5000/api/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Automated Campaign",
    "objective": "CONVERSIONS",
    "dailyBudget": 100,
    "status": "PAUSED"
  }'
```
