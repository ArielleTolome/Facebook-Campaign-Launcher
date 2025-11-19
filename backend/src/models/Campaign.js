const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Campaign = sequelize.define('Campaign', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fbCampaignId: {
    type: DataTypes.STRING,
    unique: true,
    field: 'fb_campaign_id'
  },
  objective: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'PAUSED', 'DELETED', 'ARCHIVED'),
    defaultValue: 'PAUSED'
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
  },
  templateId: {
    type: DataTypes.UUID,
    field: 'template_id'
  },
  isTemplate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_template'
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  adAccountId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'AdAccounts',
      key: 'id'
    }
  }
}, {
  tableName: 'campaigns',
  timestamps: true,
  underscored: true
});

Campaign.associate = function(models) {
  Campaign.belongsTo(models.AdAccount, { foreignKey: 'adAccountId', as: 'adAccount' });
  Campaign.hasMany(models.AdSet, { foreignKey: 'campaign_id', as: 'adSets' });
  Campaign.hasMany(models.ABTest, { foreignKey: 'campaign_id', as: 'abTests' });
};

module.exports = Campaign;
