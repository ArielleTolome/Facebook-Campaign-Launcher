const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CampaignSnapshot = sequelize.define('CampaignSnapshot', {
  campaignId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Campaigns', // 'Campaigns' can be a table name or a model name
      key: 'id',
    },
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  impressions: {
    type: DataTypes.INTEGER,
  },
  clicks: {
    type: DataTypes.INTEGER,
  },
  spend: {
    type: DataTypes.FLOAT,
  },
  revenue: {
    type: DataTypes.FLOAT,
  },
  // Add other metrics as needed
}, {
  indexes: [
    {
      fields: ['campaignId', 'date'],
    },
  ],
});

module.exports = CampaignSnapshot;
