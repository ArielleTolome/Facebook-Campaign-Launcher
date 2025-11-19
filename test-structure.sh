#!/bin/bash

# Test script to verify the Facebook Campaign Launcher setup

echo "🧪 Facebook Campaign Launcher - Structure Verification"
echo "======================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check function
check() {
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} $1"
  else
    echo -e "${RED}✗${NC} $1"
    exit 1
  fi
}

# Check backend structure
echo "Checking Backend Structure..."
[ -f "backend/package.json" ]
check "Backend package.json exists"

[ -f "backend/src/server.js" ]
check "Backend server.js exists"

[ -f "backend/src/config/database.js" ]
check "Database config exists"

[ -d "backend/src/models" ]
check "Models directory exists"

[ -d "backend/src/controllers" ]
check "Controllers directory exists"

[ -d "backend/src/services" ]
check "Services directory exists"

[ -d "backend/src/routes" ]
check "Routes directory exists"

[ -f "backend/.env.example" ]
check "Backend .env.example exists"

[ -f "backend/Dockerfile" ]
check "Backend Dockerfile exists"

echo ""
echo "Checking Frontend Structure..."
[ -f "frontend/package.json" ]
check "Frontend package.json exists"

[ -f "frontend/src/App.js" ]
check "App.js exists"

[ -f "frontend/src/index.js" ]
check "index.js exists"

[ -d "frontend/src/components" ]
check "Components directory exists"

[ -d "frontend/src/pages" ]
check "Pages directory exists"

[ -d "frontend/src/services" ]
check "Services directory exists"

[ -d "frontend/src/styles" ]
check "Styles directory exists"

[ -f "frontend/public/index.html" ]
check "index.html exists"

[ -f "frontend/.env.example" ]
check "Frontend .env.example exists"

[ -f "frontend/Dockerfile" ]
check "Frontend Dockerfile exists"

echo ""
echo "Checking Documentation..."
[ -f "README.md" ]
check "README.md exists"

[ -f "API_DOCUMENTATION.md" ]
check "API_DOCUMENTATION.md exists"

[ -f "QUICKSTART.md" ]
check "QUICKSTART.md exists"

[ -f "CONTRIBUTING.md" ]
check "CONTRIBUTING.md exists"

[ -f "CHANGELOG.md" ]
check "CHANGELOG.md exists"

[ -f "LICENSE" ]
check "LICENSE exists"

echo ""
echo "Checking DevOps Files..."
[ -f "docker-compose.yml" ]
check "docker-compose.yml exists"

[ -f ".gitignore" ]
check ".gitignore exists"

echo ""
echo "Checking Key Features Implementation..."

# Check for bulk operations
grep -q "bulkCreate" backend/src/services/campaignService.js
check "Bulk campaign creation implemented"

# Check for templates
grep -q "isTemplate" backend/src/models/Campaign.js
check "Template support implemented"

# Check for A/B testing
[ -f "backend/src/models/ABTest.js" ]
check "A/B testing model exists"

# Check for Facebook API integration
[ -f "backend/src/services/facebookAPI.js" ]
check "Facebook API service exists"

# Check for dashboard
[ -f "frontend/src/components/Dashboard.js" ]
check "Dashboard component exists"

# Check for creative library
[ -f "frontend/src/components/CreativeLibrary.js" ]
check "Creative library component exists"

echo ""
echo "Checking Data Models..."
[ -f "backend/src/models/Campaign.js" ]
check "Campaign model exists"

[ -f "backend/src/models/AdSet.js" ]
check "AdSet model exists"

[ -f "backend/src/models/Ad.js" ]
check "Ad model exists"

[ -f "backend/src/models/Creative.js" ]
check "Creative model exists"

[ -f "backend/src/models/ABTest.js" ]
check "ABTest model exists"

echo ""
echo "Checking API Routes..."
[ -f "backend/src/routes/campaigns.js" ]
check "Campaign routes exist"

[ -f "backend/src/routes/creatives.js" ]
check "Creative routes exist"

[ -f "backend/src/routes/abTests.js" ]
check "A/B test routes exist"

echo ""
echo "Checking Controllers..."
[ -f "backend/src/controllers/campaignController.js" ]
check "Campaign controller exists"

[ -f "backend/src/controllers/creativeController.js" ]
check "Creative controller exists"

[ -f "backend/src/controllers/abTestController.js" ]
check "A/B test controller exists"

echo ""
echo "======================================================"
echo -e "${GREEN}✅ All structure checks passed!${NC}"
echo ""
echo "Next steps:"
echo "1. Set up PostgreSQL database"
echo "2. Configure environment variables"
echo "3. Install dependencies (npm install in both directories)"
echo "4. Run the application"
echo ""
echo "See QUICKSTART.md for detailed setup instructions."
