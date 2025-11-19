const { sequelize, Campaign, Creative, ABTest } = require('./models');

async function seedDatabase() {
  try {
    console.log('Starting database seed...');

    // Sync database
    await sequelize.sync({ force: false });

    // Create sample templates
    console.log('Creating campaign templates...');
    const template1 = await Campaign.create({
      name: 'E-commerce Sales Template',
      objective: 'CONVERSIONS',
      dailyBudget: 100.00,
      isTemplate: true,
      status: 'PAUSED',
      metadata: {
        description: 'Template for e-commerce sales campaigns',
        bestFor: 'Product sales and conversions'
      }
    });

    const template2 = await Campaign.create({
      name: 'Brand Awareness Template',
      objective: 'BRAND_AWARENESS',
      dailyBudget: 50.00,
      isTemplate: true,
      status: 'PAUSED',
      metadata: {
        description: 'Template for brand awareness campaigns',
        bestFor: 'Increasing brand visibility'
      }
    });

    const template3 = await Campaign.create({
      name: 'Lead Generation Template',
      objective: 'LEAD_GENERATION',
      dailyBudget: 75.00,
      isTemplate: true,
      status: 'PAUSED',
      metadata: {
        description: 'Template for lead generation campaigns',
        bestFor: 'Collecting customer leads'
      }
    });

    console.log('Created 3 campaign templates');

    // Create sample creatives
    console.log('Creating sample creatives...');
    await Creative.create({
      name: 'Summer Sale Creative',
      title: 'Amazing Summer Deals!',
      body: 'Get up to 50% off on all summer items. Limited time offer!',
      imageUrl: 'https://via.placeholder.com/1200x628?text=Summer+Sale',
      linkUrl: 'https://example.com/summer-sale',
      callToAction: 'SHOP_NOW',
      format: 'SINGLE_IMAGE',
      status: 'ACTIVE'
    });

    await Creative.create({
      name: 'New Product Launch',
      title: 'Introducing Our Latest Product',
      body: 'Be the first to experience innovation. Pre-order now!',
      imageUrl: 'https://via.placeholder.com/1200x628?text=New+Product',
      linkUrl: 'https://example.com/new-product',
      callToAction: 'LEARN_MORE',
      format: 'SINGLE_IMAGE',
      status: 'ACTIVE'
    });

    await Creative.create({
      name: 'Free Trial Offer',
      title: 'Try It Free for 30 Days',
      body: 'No credit card required. Start your free trial today!',
      imageUrl: 'https://via.placeholder.com/1200x628?text=Free+Trial',
      linkUrl: 'https://example.com/free-trial',
      callToAction: 'SIGN_UP',
      format: 'SINGLE_IMAGE',
      status: 'ACTIVE'
    });

    await Creative.create({
      name: 'Holiday Special',
      title: 'Holiday Season Specials',
      body: 'Celebrate the season with our exclusive holiday deals!',
      imageUrl: 'https://via.placeholder.com/1200x628?text=Holiday+Special',
      linkUrl: 'https://example.com/holiday',
      callToAction: 'SHOP_NOW',
      format: 'SINGLE_IMAGE',
      status: 'ACTIVE'
    });

    await Creative.create({
      name: 'Customer Testimonial',
      title: 'See What Our Customers Say',
      body: 'Join thousands of satisfied customers. Read their stories!',
      imageUrl: 'https://via.placeholder.com/1200x628?text=Testimonials',
      linkUrl: 'https://example.com/testimonials',
      callToAction: 'LEARN_MORE',
      format: 'SINGLE_IMAGE',
      status: 'ACTIVE'
    });

    console.log('Created 5 sample creatives');

    // Create multiple sample campaigns with different statuses
    console.log('Creating sample campaigns...');

    const campaign1 = await Campaign.create({
      name: 'Spring Product Launch 2024',
      objective: 'CONVERSIONS',
      dailyBudget: 150.00,
      status: 'ACTIVE',
      fbCampaignId: 'mock_campaign_1001',
      isTemplate: false,
      startTime: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // Started 14 days ago
      metadata: {
        description: 'Campaign for spring product launch',
        targetAudience: 'Age 25-45, interested in lifestyle products'
      }
    });

    const campaign2 = await Campaign.create({
      name: 'Summer Sale Blitz',
      objective: 'CONVERSIONS',
      dailyBudget: 200.00,
      status: 'ACTIVE',
      fbCampaignId: 'mock_campaign_1002',
      isTemplate: false,
      startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Started 7 days ago
      metadata: {
        description: 'Aggressive summer sale campaign',
        targetAudience: 'Shoppers interested in seasonal deals'
      }
    });

    const campaign3 = await Campaign.create({
      name: 'Brand Awareness - Q2 2024',
      objective: 'BRAND_AWARENESS',
      dailyBudget: 75.00,
      status: 'ACTIVE',
      fbCampaignId: 'mock_campaign_1003',
      isTemplate: false,
      startTime: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // Started 21 days ago
      metadata: {
        description: 'Build brand awareness in new markets',
        targetAudience: 'Broad audience 18-65'
      }
    });

    const campaign4 = await Campaign.create({
      name: 'Lead Gen - Free Trial Campaign',
      objective: 'LEAD_GENERATION',
      dailyBudget: 100.00,
      status: 'PAUSED',
      fbCampaignId: 'mock_campaign_1004',
      isTemplate: false,
      metadata: {
        description: 'Generate leads through free trial offers',
        targetAudience: 'Business professionals'
      }
    });

    const campaign5 = await Campaign.create({
      name: 'Holiday Season 2024 Pre-Launch',
      objective: 'CONVERSIONS',
      dailyBudget: 250.00,
      status: 'PAUSED',
      fbCampaignId: 'mock_campaign_1005',
      isTemplate: false,
      metadata: {
        description: 'Preparing for holiday season rush',
        targetAudience: 'Holiday shoppers, gift buyers'
      }
    });

    console.log('Created 5 sample campaigns');

    // Create sample A/B tests
    console.log('Creating sample A/B tests...');

    await ABTest.create({
      name: 'Creative A/B Test - Summer vs Holiday',
      campaignId: campaign1.id,
      testType: 'CREATIVE',
      status: 'RUNNING',
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      variants: [
        {
          id: 'variant_a',
          name: 'Summer Theme',
          description: 'Summer-themed creative with bright colors'
        },
        {
          id: 'variant_b',
          name: 'Professional Theme',
          description: 'Professional-themed creative'
        }
      ],
      winnerCriteria: 'CTR',
      results: {
        variant_a: { impressions: 25000, clicks: 850, ctr: 3.4 },
        variant_b: { impressions: 24800, clicks: 920, ctr: 3.71 }
      }
    });

    await ABTest.create({
      name: 'Audience Test - Age Groups',
      campaignId: campaign2.id,
      testType: 'AUDIENCE',
      status: 'RUNNING',
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      variants: [
        {
          id: 'variant_a',
          name: '18-34 Age Group',
          description: 'Targeting younger audience'
        },
        {
          id: 'variant_b',
          name: '35-54 Age Group',
          description: 'Targeting middle-aged audience'
        }
      ],
      winnerCriteria: 'CONVERSIONS',
      results: {
        variant_a: { impressions: 30000, clicks: 1200, conversions: 85 },
        variant_b: { impressions: 28500, clicks: 1050, conversions: 92 }
      }
    });

    await ABTest.create({
      name: 'Placement Test - Feed vs Stories',
      campaignId: campaign3.id,
      testType: 'PLACEMENT',
      status: 'DRAFT',
      variants: [
        {
          id: 'variant_a',
          name: 'News Feed Only',
          description: 'Show ads only in news feed'
        },
        {
          id: 'variant_b',
          name: 'Stories Only',
          description: 'Show ads only in stories'
        }
      ],
      winnerCriteria: 'CTR',
      results: {}
    });

    console.log('Created 3 sample A/B tests');

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📊 Sample data created:');
    console.log('   ├─ 3 Campaign Templates');
    console.log('   ├─ 5 Sample Creatives');
    console.log('   ├─ 5 Sample Campaigns (3 Active, 2 Paused)');
    console.log('   └─ 3 Sample A/B Tests (2 Running, 1 Draft)');
    console.log('\n🎭 Mockup Mode is enabled - No Facebook credentials needed!');
    console.log('\n🚀 You can now start using the application!');
    console.log('   Frontend: http://localhost:3000');
    console.log('   Backend:  http://localhost:5000/api');

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

seedDatabase();
