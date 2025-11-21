# Facebook Campaign Launcher

A comprehensive Facebook Campaign Launcher for affiliate marketing, built with React, Node.js, and PostgreSQL.

## 📚 Documentation

### Feature Analysis & Planning
- **[Feature Analysis Summary](FEATURE_ANALYSIS_SUMMARY.md)** - Executive dashboard with visual metrics and roadmap
- **[Feature Recommendations](FEATURE_RECOMMENDATIONS.md)** - Comprehensive analysis of 25+ potential features with priorities
- **[Features Quick Reference](FEATURES_QUICK_REFERENCE.md)** - Top 10 features and quick implementation guide
- **[Immediate Action Plan](IMMEDIATE_ACTION_PLAN.md)** - Step-by-step guide for implementing priority features

### Technical Documentation
- **[API Documentation](API_DOCUMENTATION.md)** - Complete API reference with examples
- **[Audience System](AUDIENCE_API_DOCUMENTATION.md)** - Audience management API documentation
- **[Implementation Summary](IMPLEMENTATION_SUMMARY.md)** - Technical implementation details

### Getting Started
- **[Quick Start Guide](QUICKSTART.md)** - Rapid setup instructions
- **[Contributing Guide](CONTRIBUTING.md)** - Developer contribution guidelines
- **[Changelog](CHANGELOG.md)** - Version history and updates

## Features

- **Bulk Campaign Creation**: Create multiple campaigns simultaneously
- **Audience Targeting**: Advanced targeting options for precise audience reach
- **Creative Library Management**: Store and manage your ad creatives
- **Budget Controls**: Set daily and lifetime budgets for campaigns
- **Real-time Performance Dashboard**: Monitor campaign performance metrics
- **Facebook Marketing API Integration**: Direct integration with Facebook's Marketing API
- **Campaign Templates**: Save and reuse successful campaign configurations
- **A/B Testing**: Test different variants to optimize performance
- **Batch Operations**: Perform bulk actions on multiple campaigns
- **API Endpoints**: RESTful API for automation integration

## Tech Stack

### Backend
- Node.js with Express
- PostgreSQL database
- Sequelize ORM
- Facebook Marketing API integration
- Helmet for security
- Rate limiting
- CORS support

### Frontend
- React 18
- React Router for navigation
- Recharts for data visualization
- Axios for API calls
- Responsive CSS

## Prerequisites

- Node.js 14+ and npm
- PostgreSQL 12+
- Facebook Developer Account with:
  - App ID
  - App Secret
  - Access Token
  - Ad Account ID

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/ArielleTolome/Facebook-Campaign-Launcher.git
cd Facebook-Campaign-Launcher
```

### 2. Backend Setup

```bash
cd backend
npm install

# Copy environment file and configure
cp .env.example .env
# Edit .env with your database and Facebook API credentials
```

Configure your `.env` file:

```env
PORT=5000
NODE_ENV=development

DB_NAME=facebook_campaign_launcher
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432

FB_APP_ID=your_facebook_app_id
FB_APP_SECRET=your_facebook_app_secret
FB_ACCESS_TOKEN=your_facebook_access_token
FB_API_VERSION=v18.0
```

### 3. Database Setup

Create a PostgreSQL database:

```bash
createdb facebook_campaign_launcher
```

The application will automatically sync the database schema on startup.

### 4. Frontend Setup

```bash
cd ../frontend
npm install

# Copy environment file
cp .env.example .env
# Edit if needed (default points to localhost:5000)
```

## Running the Application

### Start Backend Server

```bash
cd backend
npm start
# or for development with auto-reload
npm run dev
```

The backend API will run on `http://localhost:5000`

### Start Frontend Application

```bash
cd frontend
npm start
```

The frontend will run on `http://localhost:3000`

## API Documentation

### Base URL

```
http://localhost:5000/api
```

### Endpoints

#### Campaigns

- `GET /campaigns` - Get all campaigns
  - Query params: `status`, `isTemplate`
- `GET /campaigns/:id` - Get campaign by ID
- `POST /campaigns` - Create new campaign
  - Query params: `adAccountId` (optional)
  - Body: Campaign data
- `POST /campaigns/bulk` - Bulk create campaigns
  - Query params: `adAccountId` (optional)
  - Body: `{ campaigns: [] }`
- `PUT /campaigns/:id` - Update campaign
- `DELETE /campaigns/:id` - Delete campaign (soft delete)
- `POST /campaigns/templates/:templateId/create` - Create from template
- `GET /campaigns/:id/insights` - Get campaign insights from Facebook

#### Creatives

- `GET /creatives` - Get all creatives
  - Query params: `status`, `format`
- `GET /creatives/:id` - Get creative by ID
- `POST /creatives` - Create new creative
  - Query params: `adAccountId` (optional)
- `POST /creatives/bulk` - Bulk create creatives
- `PUT /creatives/:id` - Update creative
- `DELETE /creatives/:id` - Archive creative

#### A/B Tests

- `GET /ab-tests` - Get all A/B tests
  - Query params: `campaignId`, `status`, `testType`
- `GET /ab-tests/:id` - Get A/B test by ID
- `POST /ab-tests` - Create new A/B test
- `PUT /ab-tests/:id` - Update A/B test
- `POST /ab-tests/:id/start` - Start A/B test
- `POST /ab-tests/:id/complete` - Complete A/B test
- `GET /ab-tests/:id/analyze` - Analyze test results

#### Health Check

- `GET /health` - Server health check

### Example API Requests

#### Create Campaign

```bash
curl -X POST http://localhost:5000/api/campaigns?adAccountId=YOUR_AD_ACCOUNT_ID \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Summer Sale Campaign",
    "objective": "LINK_CLICKS",
    "dailyBudget": 50.00,
    "status": "PAUSED"
  }'
```

#### Bulk Create Campaigns

```bash
curl -X POST http://localhost:5000/api/campaigns/bulk?adAccountId=YOUR_AD_ACCOUNT_ID \
  -H "Content-Type: application/json" \
  -d '{
    "campaigns": [
      {
        "name": "Campaign 1",
        "objective": "CONVERSIONS",
        "dailyBudget": 100
      },
      {
        "name": "Campaign 2",
        "objective": "REACH",
        "dailyBudget": 75
      }
    ]
  }'
```

#### Create Creative

```bash
curl -X POST http://localhost:5000/api/creatives \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Summer Sale Creative",
    "title": "Amazing Summer Deals",
    "body": "Get up to 50% off on selected items",
    "imageUrl": "https://example.com/image.jpg",
    "linkUrl": "https://example.com/sale",
    "callToAction": "SHOP_NOW"
  }'
```

## Database Schema

### campaigns
- id (UUID, Primary Key)
- name (String)
- fb_campaign_id (String, Unique)
- objective (String)
- status (Enum: ACTIVE, PAUSED, DELETED, ARCHIVED)
- daily_budget (Decimal)
- lifetime_budget (Decimal)
- start_time (Date)
- end_time (Date)
- template_id (UUID)
- is_template (Boolean)
- metadata (JSONB)
- created_at, updated_at (Timestamps)

### ad_sets
- id (UUID, Primary Key)
- campaign_id (UUID, Foreign Key)
- name (String)
- fb_ad_set_id (String, Unique)
- status (Enum)
- targeting (JSONB)
- billing (String)
- bid_amount (Decimal)
- daily_budget, lifetime_budget (Decimal)
- start_time, end_time (Date)
- created_at, updated_at (Timestamps)

### creatives
- id (UUID, Primary Key)
- name (String)
- fb_creative_id (String, Unique)
- title, body (String/Text)
- image_url, video_url, link_url (String)
- call_to_action (String)
- format (String)
- metadata (JSONB)
- status (Enum: ACTIVE, ARCHIVED)
- created_at, updated_at (Timestamps)

### ads
- id (UUID, Primary Key)
- ad_set_id (UUID, Foreign Key)
- creative_id (UUID, Foreign Key)
- name (String)
- fb_ad_id (String, Unique)
- status (Enum)
- created_at, updated_at (Timestamps)

### ab_tests
- id (UUID, Primary Key)
- campaign_id (UUID, Foreign Key)
- name (String)
- test_type (Enum: CREATIVE, AUDIENCE, PLACEMENT, DELIVERY_OPTIMIZATION)
- status (Enum: DRAFT, RUNNING, COMPLETED, ARCHIVED)
- variants (JSONB)
- winner_criteria (String)
- results (JSONB)
- start_date, end_date (Date)
- created_at, updated_at (Timestamps)

## Features Guide

### 1. Campaign Management

- Create individual or bulk campaigns
- Use templates for quick campaign creation
- Pause, activate, or archive campaigns
- Set budget controls (daily/lifetime)
- Monitor campaign status

### 2. Creative Library

- Store and organize ad creatives
- Support for images and videos
- Set call-to-action buttons
- Reuse creatives across campaigns

### 3. A/B Testing

- Test creative variants
- Test audience segments
- Test placement options
- Analyze performance metrics
- Determine winning variants

### 4. Performance Dashboard

- Real-time metrics visualization
- Campaign insights from Facebook
- Key metrics: impressions, clicks, CTR, CPC, CPM
- Spend tracking
- Campaign comparison

### 5. Automation Integration

Use the API endpoints to:
- Automate campaign creation
- Schedule campaign activations
- Auto-scale budgets based on performance
- Integrate with third-party tools
- Build custom workflows

## Security Features

- Helmet.js for HTTP security headers
- Rate limiting to prevent abuse
- Environment-based configuration
- CORS configuration
- Input validation

## Development

### Backend Development

```bash
cd backend
npm run dev  # Uses nodemon for auto-reload
```

### Frontend Development

```bash
cd frontend
npm start  # React development server with hot reload
```

### Linting

```bash
# Backend
cd backend
npm run lint

# Frontend
cd frontend
npm run lint
```

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Production Deployment

### Backend

1. Set `NODE_ENV=production` in environment
2. Configure production database
3. Set secure Facebook API credentials
4. Use process manager like PM2:

```bash
npm install -g pm2
pm2 start src/server.js --name fb-campaign-backend
```

### Frontend

1. Build the production bundle:

```bash
cd frontend
npm run build
```

2. Serve the `build` folder with a web server (nginx, Apache, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License

## Support

For issues and questions, please open an issue on GitHub.

## Author

Arielle Tolome

## Acknowledgments

- Facebook Marketing API documentation
- React community
- Node.js and Express communities
