const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AdSet = sequelize.define('AdSet', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  campaignId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'campaign_id'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fbAdSetId: {
    type: DataTypes.STRING,
    unique: true,
    field: 'fb_ad_set_id'
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'PAUSED', 'DELETED', 'ARCHIVED'),
    defaultValue: 'PAUSED'
  },
  targeting: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {}
  },
  billing: {
    type: DataTypes.STRING
  },
  bidAmount: {
    type: DataTypes.DECIMAL(10, 2),
    field: 'bid_amount'
  },
  dailyBudget: {
    type: DataTypes.DECIMAL(10, 2),
    field: 'daily_budget'
  },
  lifetimeBudget: {
    type: DataTypes.DECIMAL(10, 2),
    field: 'lifetime_budget'
  },
  startTime: {
    type: DataTypes.DATE,
    field: 'start_time'
  },
  endTime: {
    type: DataTypes.DATE,
    field: 'end_time'
  }
}, {
  tableName: 'ad_sets',
  timestamps: true,
  underscored: true
});

module.exports = AdSet;
