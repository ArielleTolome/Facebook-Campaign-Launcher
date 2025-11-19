const sequelize = require('../config/database');
const Campaign = require('./Campaign');
const AdSet = require('./AdSet');
const Ad = require('./Ad');
const Creative = require('./Creative');
const CreativePerformance = require('./CreativePerformance');
const ABTest = require('./ABTest');

// Define associations
Campaign.hasMany(AdSet, { foreignKey: 'campaign_id', as: 'adSets' });
AdSet.belongsTo(Campaign, { foreignKey: 'campaign_id', as: 'campaign' });

AdSet.hasMany(Ad, { foreignKey: 'ad_set_id', as: 'ads' });
Ad.belongsTo(AdSet, { foreignKey: 'ad_set_id', as: 'adSet' });

Creative.hasMany(Ad, { foreignKey: 'creative_id', as: 'ads' });
Ad.belongsTo(Creative, { foreignKey: 'creative_id', as: 'creative' });

Creative.hasMany(CreativePerformance, { foreignKey: 'creative_id', as: 'performance' });
CreativePerformance.belongsTo(Creative, { foreignKey: 'creative_id', as: 'creative' });

Campaign.hasMany(ABTest, { foreignKey: 'campaign_id', as: 'abTests' });
ABTest.belongsTo(Campaign, { foreignKey: 'campaign_id', as: 'campaign' });

module.exports = {
  sequelize,
  Campaign,
  AdSet,
  Ad,
  Creative,
  CreativePerformance,
  ABTest
};
