#!/bin/bash

# Verification script for Mockup Mode setup
# This script checks that all necessary files and configurations are in place

echo "🔍 Verifying Mockup Mode Setup..."
echo ""

errors=0

# Check for required files
echo "📁 Checking required files..."
files=(
  "backend/src/services/mockFacebookAPI.js"
  "backend/src/services/facebookAPI.js"
  "backend/.env.example"
  "docker-compose.yml"
  "MOCKUP_DEPLOY.md"
  "backend/src/seed.js"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file - MISSING"
    ((errors++))
  fi
done

echo ""
echo "⚙️  Checking configuration..."

# Check docker-compose.yml for mockup mode
if grep -q 'FB_MOCKUP_MODE: "true"' docker-compose.yml; then
  echo "  ✅ docker-compose.yml has FB_MOCKUP_MODE enabled"
else
  echo "  ❌ docker-compose.yml missing FB_MOCKUP_MODE"
  ((errors++))
fi

# Check .env.example for mockup mode
if grep -q 'FB_MOCKUP_MODE=true' backend/.env.example; then
  echo "  ✅ backend/.env.example has FB_MOCKUP_MODE"
else
  echo "  ❌ backend/.env.example missing FB_MOCKUP_MODE"
  ((errors++))
fi

# Check facebookAPI.js for mockup support
if grep -q 'mockFacebookAPI' backend/src/services/facebookAPI.js; then
  echo "  ✅ facebookAPI.js has mockup mode integration"
else
  echo "  ❌ facebookAPI.js missing mockup mode integration"
  ((errors++))
fi

echo ""
echo "📊 Checking seed data enhancements..."

# Check if seed.js has multiple campaigns
campaign_count=$(grep -c "Campaign.create" backend/src/seed.js | head -1)
if [ "$campaign_count" -ge 5 ]; then
  echo "  ✅ Seed script has multiple campaigns ($campaign_count creates)"
else
  echo "  ⚠️  Seed script may need more campaign data"
fi

echo ""
if [ $errors -eq 0 ]; then
  echo "✅ All checks passed! Mockup mode is properly configured."
  echo ""
  echo "🚀 Quick Deploy Commands:"
  echo "   docker-compose up -d"
  echo "   docker-compose exec backend npm run seed"
  echo "   # Visit http://localhost:3000"
  echo ""
  echo "📚 Read MOCKUP_DEPLOY.md for complete instructions"
  exit 0
else
  echo "❌ Found $errors error(s). Please review the configuration."
  exit 1
fi
