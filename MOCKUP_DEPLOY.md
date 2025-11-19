# 🎭 Mockup Mode - Quick Deploy Guide

This guide will help you deploy a fully functional **mockup version** of the Facebook Campaign Launcher in minutes, without needing actual Facebook API credentials.

## 🌟 What is Mockup Mode?

Mockup Mode is a special configuration that allows you to:

- **Test the full application** without Facebook API access
- **Demo the platform** to stakeholders or clients
- **Develop and test** new features locally
- **Get live immediately** - No waiting for API approvals

The mockup mode uses simulated Facebook API responses with realistic data, so the application behaves exactly as it would with real Facebook integration.

---

## 🚀 Quick Deploy (5 Minutes)

### Prerequisites

You only need **ONE** of the following:

- **Option A**: Docker & Docker Compose (Recommended - Fastest)
- **Option B**: Node.js 14+ and PostgreSQL 12+

### Option A: Deploy with Docker (Recommended)

This is the **fastest way** to get the mockup running:

```bash
# 1. Clone the repository
git clone <repository-url>
cd Facebook-Campaign-Launcher

# 2. Start all services (Database, Backend, Frontend)
docker-compose up -d

# 3. Wait for services to start (about 30-60 seconds)
docker-compose logs -f backend

# Look for: "🎭 MOCKUP MODE ENABLED" and "Server running on port 5000"
# Press Ctrl+C to exit logs

# 4. Seed the database with sample data
docker-compose exec backend npm run seed

# 5. Access the application
# Frontend: http://localhost:3000
# Backend:  http://localhost:5000/api
```

**That's it!** Your mockup is now running with:
- 3 Campaign Templates
- 5 Sample Creatives
- 5 Active Campaigns
- 3 A/B Tests

---

### Option B: Manual Deployment

If you prefer not to use Docker:

```bash
# 1. Clone the repository
git clone <repository-url>
cd Facebook-Campaign-Launcher

# 2. Set up the database
# Make sure PostgreSQL is running
createdb facebook_campaign_launcher

# 3. Configure backend
cd backend
cp .env.example .env

# Edit .env and ensure FB_MOCKUP_MODE=true (it's already set by default)
# No need to add real Facebook credentials!

# Install dependencies and start
npm install
npm run seed    # Load sample data
npm run dev     # Start backend server

# 4. In a new terminal, configure frontend
cd ../frontend
cp .env.example .env

# Install dependencies and start
npm install
npm start       # Start React development server

# 5. Access the application
# Frontend: http://localhost:3000
# Backend:  http://localhost:5000/api
```

---

## 🔍 Verify It's Working

### 1. Check Backend Health

```bash
curl http://localhost:5000/api/health
```

You should see:
```json
{"status":"OK","timestamp":"..."}
```

### 2. Check Frontend

Open your browser to `http://localhost:3000`

You should see the dashboard with sample campaigns.

### 3. Verify Mockup Mode

Check the backend logs - you should see:
```
🎭 MOCKUP MODE ENABLED - Using simulated Facebook API responses
```

---

## 📊 What's Included in Mockup Mode

When you deploy with mockup mode, you get:

### Sample Data
- **3 Campaign Templates** ready to use
- **5 Sample Creatives** (images and copy)
- **5 Sample Campaigns** (3 active, 2 paused)
- **3 A/B Tests** (2 running, 1 draft)

### Working Features
- ✅ Create campaigns (generates mock Facebook IDs)
- ✅ Edit and delete campaigns
- ✅ Creative library management
- ✅ A/B testing framework
- ✅ Performance dashboard (with simulated metrics)
- ✅ Campaign insights (realistic mock data)
- ✅ Bulk operations
- ✅ Campaign templates

### Simulated API Responses
All Facebook API calls return realistic mock data:
- Campaign creation returns mock campaign IDs
- Insights show realistic metrics (impressions, clicks, CTR, etc.)
- All operations complete successfully with simulated delays (50-200ms)

---

## 🎨 Customizing the Mockup

### Add More Sample Data

You can modify `backend/src/seed.js` to add more campaigns, creatives, or tests:

```javascript
// Example: Add another campaign
await Campaign.create({
  name: 'Your Custom Campaign',
  objective: 'CONVERSIONS',
  dailyBudget: 100.00,
  status: 'ACTIVE',
  fbCampaignId: 'mock_campaign_1006',
  // ... more fields
});
```

Then re-run the seed:
```bash
docker-compose exec backend npm run seed
# OR if manual: npm run seed
```

### Adjust Mock Metrics

Edit `backend/src/services/mockFacebookAPI.js` to change how metrics are generated:

```javascript
generateRandomMetrics() {
  const impressions = Math.floor(Math.random() * 50000) + 10000;
  // Customize the ranges here...
}
```

---

## 🔄 Switching to Production Mode

When you're ready to connect to the real Facebook Marketing API:

### 1. Get Facebook API Credentials

Follow the [Facebook Marketing API Setup Guide](https://developers.facebook.com/docs/marketing-apis/get-started):

- Create a Facebook Developer Account
- Create a new App
- Add the "Marketing API" product
- Get your App ID, App Secret, and Access Token

### 2. Update Configuration

**In Docker:**
Edit `docker-compose.yml` and change:
```yaml
environment:
  FB_MOCKUP_MODE: "false"  # Change to false
  FB_APP_ID: "your_real_app_id"
  FB_APP_SECRET: "your_real_app_secret"
  FB_ACCESS_TOKEN: "your_real_access_token"
```

**Manual Setup:**
Edit `backend/.env`:
```env
FB_MOCKUP_MODE=false
FB_APP_ID=your_real_app_id
FB_APP_SECRET=your_real_app_secret
FB_ACCESS_TOKEN=your_real_access_token
```

### 3. Restart the Application

```bash
# Docker
docker-compose restart backend

# Manual
# Stop the backend (Ctrl+C) and run:
npm run dev
```

---

## 🐛 Troubleshooting

### Backend won't start

**Check database connection:**
```bash
# Docker
docker-compose logs postgres

# Manual
psql -U postgres -d facebook_campaign_launcher -c "SELECT 1;"
```

### Frontend shows "Network Error"

**Verify backend is running:**
```bash
curl http://localhost:5000/api/health
```

**Check CORS settings** in `backend/src/server.js`

### Port already in use

**Change ports in docker-compose.yml:**
```yaml
ports:
  - "3001:3000"  # Frontend on 3001 instead
  - "5001:5000"  # Backend on 5001 instead
```

Don't forget to update `REACT_APP_API_URL` in frontend environment!

### Database seed fails

**Reset database:**
```bash
# Docker
docker-compose down -v  # This removes volumes
docker-compose up -d
docker-compose exec backend npm run seed

# Manual
dropdb facebook_campaign_launcher
createdb facebook_campaign_launcher
npm run seed
```

---

## 📦 Production Deployment Options

### Cloud Platforms

#### Heroku
```bash
# Add Heroku Postgres addon
heroku addons:create heroku-postgresql:hobby-dev

# Set mockup mode (or add real credentials)
heroku config:set FB_MOCKUP_MODE=true

# Deploy
git push heroku main
```

#### AWS (ECS/Fargate)
1. Build and push Docker images to ECR
2. Create task definitions for backend/frontend
3. Set environment variables in task definition
4. Deploy with ECS service

#### DigitalOcean App Platform
1. Connect your repository
2. Configure build and run commands
3. Add environment variables
4. Deploy

#### Railway / Render
1. Connect repository
2. Auto-detects Docker configuration
3. Add environment variables
4. Deploy with one click

### Environment Variables for Production

Always set these for production:

```env
NODE_ENV=production
DB_HOST=<your-production-db-host>
DB_NAME=<your-production-db-name>
DB_USER=<your-production-db-user>
DB_PASSWORD=<your-production-db-password>

# For mockup mode
FB_MOCKUP_MODE=true

# OR for production with real API
FB_MOCKUP_MODE=false
FB_APP_ID=<real-app-id>
FB_APP_SECRET=<real-app-secret>
FB_ACCESS_TOKEN=<real-access-token>
```

---

## 🎓 Next Steps

Now that your mockup is running:

1. **Explore the Dashboard** - View sample campaigns and metrics
2. **Create a Campaign** - Use the campaign creation form
3. **Test A/B Testing** - Create and run A/B tests
4. **Try the API** - Use the REST API endpoints (see `API_DOCUMENTATION.md`)
5. **Customize** - Modify the seed data or add your own features

---

## 📚 Additional Resources

- [Main README](README.md) - Full project documentation
- [Quick Start Guide](QUICKSTART.md) - Detailed setup instructions
- [API Documentation](API_DOCUMENTATION.md) - Complete API reference
- [Contributing Guide](CONTRIBUTING.md) - Development guidelines

---

## 💡 Tips for Demoing

When showing the mockup to clients or stakeholders:

1. **Start with the dashboard** - Shows the complete picture
2. **Create a campaign live** - Demonstrates the user experience
3. **Show the creative library** - Highlights content management
4. **Run an A/B test** - Displays advanced features
5. **Pull up the API docs** - For technical audiences

**Remember**: All data is simulated but behaves realistically. The actual Facebook integration works identically, just with real data!

---

## ❓ FAQ

**Q: Can I use this mockup for production?**
A: The mockup is designed for demos and testing. For production, disable mockup mode and add real Facebook API credentials.

**Q: Will my data persist?**
A: Yes! The PostgreSQL database persists all your data. Only the Facebook API calls are mocked.

**Q: Can I deploy this to show clients?**
A: Absolutely! That's exactly what it's designed for. Deploy to any cloud platform and share the URL.

**Q: How do I add my own branding?**
A: Modify the React components in `frontend/src/components/` and update CSS in `frontend/src/styles/`.

**Q: Can I test real Facebook campaigns in mockup mode?**
A: No, mockup mode doesn't connect to Facebook. To test real campaigns, disable mockup mode and add real credentials.

---

**Ready to deploy?** Just run `docker-compose up -d` and you're live! 🚀
