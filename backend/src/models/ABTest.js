const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ABTest = sequelize.define('ABTest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  campaignId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'campaign_id'
  },
  testType: {
    type: DataTypes.ENUM('CREATIVE', 'AUDIENCE', 'PLACEMENT', 'DELIVERY_OPTIMIZATION'),
    allowNull: false,
    field: 'test_type'
  },
  status: {
    type: DataTypes.ENUM('DRAFT', 'RUNNING', 'COMPLETED', 'ARCHIVED'),
    defaultValue: 'DRAFT'
  },
  variants: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: []
  },
  winnerCriteria: {
    type: DataTypes.STRING,
    field: 'winner_criteria'
  },
  results: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  startDate: {
    type: DataTypes.DATE,
    field: 'start_date'
  },
  endDate: {
    type: DataTypes.DATE,
    field: 'end_date'
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
  tableName: 'ab_tests',
  timestamps: true,
  underscored: true
});

ABTest.associate = function(models) {
  ABTest.belongsTo(models.AdAccount, { foreignKey: 'adAccountId', as: 'adAccount' });
  ABTest.belongsTo(models.Campaign, { foreignKey: 'campaign_id', as: 'campaign' });
};

module.exports = ABTest;
