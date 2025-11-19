const { sequelize, Campaign, Creative, ABTest, Audience } = require('./models');

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

    // Create sample audiences
    console.log('Creating sample audiences...');
    await Audience.create({
      name: 'Tech-Savvy Millennials',
      description: 'Young professionals interested in technology and innovation',
      audienceType: 'SAVED',
      status: 'ACTIVE',
      targeting: {
        age: { min: 25, max: 40 },
        gender: 'ALL',
        locations: [
          { name: 'United States', id: 'US' },
          { name: 'Canada', id: 'CA' }
        ],
        interests: [
          { name: 'Technology', id: 'tech' },
          { name: 'Business', id: 'business' }
        ],
        behaviors: [
          { name: 'Early Adopters', id: 'early_adopters' },
          { name: 'Online Shoppers', id: 'online_shoppers' }
        ]
      },
      size: {
        estimatedSize: {
          min: 500000,
          max: 1200000
        }
      },
      metadata: {
        tags: ['tech', 'millennials', 'professionals']
      }
    });

    await Audience.create({
      name: 'Fashion Enthusiasts',
      description: 'People interested in fashion, style, and beauty',
      audienceType: 'SAVED',
      status: 'ACTIVE',
      targeting: {
        age: { min: 18, max: 35 },
        gender: 'ALL',
        locations: [
          { name: 'United States', id: 'US' },
          { name: 'United Kingdom', id: 'GB' },
          { name: 'France', id: 'FR' }
        ],
        interests: [
          { name: 'Fashion', id: 'fashion' }
        ],
        behaviors: [
          { name: 'Online Shoppers', id: 'online_shoppers' }
        ]
      },
      size: {
        estimatedSize: {
          min: 800000,
          max: 1800000
        }
      },
      metadata: {
        tags: ['fashion', 'lifestyle', 'shopping']
      }
    });

    await Audience.create({
      name: 'Fitness & Health Conscious',
      description: 'Audience interested in fitness, wellness, and healthy living',
      audienceType: 'SAVED',
      status: 'ACTIVE',
      targeting: {
        age: { min: 22, max: 50 },
        gender: 'ALL',
        locations: [
          { name: 'United States', id: 'US' },
          { name: 'Australia', id: 'AU' }
        ],
        interests: [
          { name: 'Health & Fitness', id: 'fitness' }
        ],
        behaviors: [
          { name: 'Mobile Users', id: 'mobile' }
        ]
      },
      size: {
        estimatedSize: {
          min: 600000,
          max: 1400000
        }
      },
      metadata: {
        tags: ['health', 'fitness', 'wellness']
      }
    });

    await Audience.create({
      name: 'Business Decision Makers',
      description: 'Small business owners and executives',
      audienceType: 'SAVED',
      status: 'ACTIVE',
      targeting: {
        age: { min: 30, max: 60 },
        gender: 'ALL',
        locations: [
          { name: 'United States', id: 'US' }
        ],
        interests: [
          { name: 'Business', id: 'business' }
        ],
        behaviors: [
          { name: 'Small Business Owners', id: 'small_biz' }
        ]
      },
      size: {
        estimatedSize: {
          min: 200000,
          max: 500000
        }
      },
      metadata: {
        tags: ['business', 'b2b', 'executives']
      }
    });

    await Audience.create({
      name: 'Travel Lovers',
      description: 'Frequent travelers and adventure seekers',
      audienceType: 'SAVED',
      status: 'ACTIVE',
      targeting: {
        age: { min: 25, max: 55 },
        gender: 'ALL',
        locations: [
          { name: 'United States', id: 'US' },
          { name: 'United Kingdom', id: 'GB' },
          { name: 'Germany', id: 'DE' }
        ],
        interests: [
          { name: 'Travel', id: 'travel' }
        ],
        behaviors: [
          { name: 'Frequent Travelers', id: 'travelers' }
        ]
      },
      size: {
        estimatedSize: {
          min: 700000,
          max: 1500000
        }
      },
      metadata: {
        tags: ['travel', 'adventure', 'lifestyle']
      }
    });

    console.log('Created 5 sample audiences');

    // Create a sample campaign
    console.log('Creating sample campaigns...');
    const sampleCampaign = await Campaign.create({
      name: 'Spring Product Launch 2024',
      objective: 'CONVERSIONS',
      dailyBudget: 150.00,
      status: 'PAUSED',
      isTemplate: false,
      metadata: {
        description: 'Campaign for spring product launch',
        targetAudience: 'Age 25-45, interested in lifestyle products'
      }
    });

    // Create a sample A/B test
    console.log('Creating sample A/B test...');
    await ABTest.create({
      name: 'Creative A/B Test - Summer vs Holiday',
      campaignId: sampleCampaign.id,
      testType: 'CREATIVE',
      status: 'DRAFT',
      variants: [
        {
          id: 'variant_a',
          name: 'Summer Theme',
          description: 'Summer-themed creative'
        },
        {
          id: 'variant_b',
          name: 'Holiday Theme',
          description: 'Holiday-themed creative'
        }
      ],
      winnerCriteria: 'CTR',
      results: {}
    });

    console.log('Created 1 sample A/B test');

    console.log('\n✅ Database seeded successfully!');
    console.log('\nSample data created:');
    console.log('- 3 Campaign Templates');
    console.log('- 5 Sample Creatives');
    console.log('- 5 Sample Audiences');
    console.log('- 1 Sample Campaign');
    console.log('- 1 Sample A/B Test');
    console.log('\nYou can now start using the application!');

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

seedDatabase();
