# Quick Start Guide

This guide will help you get the Facebook Campaign Launcher up and running quickly.

## Option 1: Using Docker (Recommended)

### Prerequisites
- Docker and Docker Compose installed

### Steps

1. Clone the repository:
```bash
git clone https://github.com/ArielleTolome/Facebook-Campaign-Launcher.git
cd Facebook-Campaign-Launcher
```

2. Create environment files:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. Edit `backend/.env` and add your Facebook API credentials:
```env
FB_APP_ID=your_facebook_app_id
FB_APP_SECRET=your_facebook_app_secret
FB_ACCESS_TOKEN=your_facebook_access_token
```

4. Start all services:
```bash
docker-compose up -d
```

5. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Health Check: http://localhost:5000/api/health

6. Stop the services:
```bash
docker-compose down
```

## Option 2: Manual Setup

### Prerequisites
- Node.js 14+ and npm
- PostgreSQL 12+

### Steps

1. Clone the repository:
```bash
git clone https://github.com/ArielleTolome/Facebook-Campaign-Launcher.git
cd Facebook-Campaign-Launcher
```

2. Set up PostgreSQL:
```bash
# Create database
createdb facebook_campaign_launcher
```

3. Set up Backend:
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

4. Set up Frontend (in a new terminal):
```bash
cd frontend
npm install
cp .env.example .env
npm start
```

5. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

## Getting Facebook API Credentials

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or use an existing one
3. Add "Marketing API" product
4. Get your:
   - App ID (from App Settings)
   - App Secret (from App Settings)
   - Access Token (from Marketing API Tools)
   - Ad Account ID (from your Facebook Business Manager)

## First Steps After Installation

### 1. Create a Campaign Template

1. Navigate to "Campaigns" in the sidebar
2. Click "Create Campaign"
3. Fill in the details:
   - Name: "My First Template"
   - Objective: Select from dropdown
   - Budget: Enter daily or lifetime budget
   - Check "Save as Template"
4. Click "Create Campaign"

### 2. Create Creatives

1. Navigate to "Creative Library"
2. Click "Create Creative"
3. Fill in:
   - Name
   - Title and Body text
   - Image URL
   - Link URL
   - Call to Action
4. Click "Create"

### 3. Create a Campaign from Template

1. Go to "Campaigns"
2. Find your template
3. Click on template options
4. Select "Create from Template"
5. Customize and create

### 4. Monitor Performance

1. Navigate to "Dashboard"
2. Select a campaign from the dropdown
3. View real-time metrics:
   - Impressions
   - Clicks
   - Spend
   - CTR, CPC, CPM

### 5. Set up A/B Testing

1. Navigate to "A/B Testing"
2. Create a new test
3. Select test type (Creative, Audience, etc.)
4. Add variants
5. Start the test
6. Monitor results

## Troubleshooting

### Database Connection Error
- Check PostgreSQL is running: `pg_isready`
- Verify credentials in `.env`
- Ensure database exists: `psql -l`

### Facebook API Error
- Verify access token is valid
- Check App ID and Secret
- Ensure Marketing API permissions are granted
- Verify Ad Account ID format (should be numeric)

### Port Already in Use
- Backend (5000): Change PORT in backend/.env
- Frontend (3000): React will offer to use different port
- Database (5432): Change DB_PORT in backend/.env

### Module Not Found
```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

## Next Steps

1. Read the [API Documentation](API_DOCUMENTATION.md) for integration
2. Explore the [README](README.md) for detailed features
3. Set up automation using the API endpoints
4. Configure production deployment

## Common Use Cases

### Bulk Campaign Creation
Use the bulk endpoint to create multiple campaigns:
```bash
curl -X POST http://localhost:5000/api/campaigns/bulk?adAccountId=YOUR_ID \
  -H "Content-Type: application/json" \
  -d '{"campaigns": [...]}'
```

### Automated Campaign Management
Create scripts to:
- Activate campaigns on schedule
- Pause low-performing campaigns
- Scale budgets based on ROI
- Clone successful campaigns

### Performance Monitoring
Use the insights endpoint to:
- Track campaign metrics
- Generate reports
- Set up alerts
- Make data-driven decisions

## Support

For issues and questions:
- Check [API Documentation](API_DOCUMENTATION.md)
- Review [README](README.md)
- Open an issue on GitHub

## Security Note

⚠️ **Never commit your `.env` files or API credentials to version control!**

The `.gitignore` file is configured to prevent this, but always double-check.
