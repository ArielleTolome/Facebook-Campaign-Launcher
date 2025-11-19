const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BudgetAlert = sequelize.define('BudgetAlert', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  campaignId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'campaign_id',
    references: {
      model: 'campaigns',
      key: 'id'
    }
  },
  alertType: {
    type: DataTypes.ENUM('OVERSPEND', 'UNDERSPEND', 'AUTO_PAUSED', 'BUDGET_EXHAUSTED'),
    allowNull: false,
    field: 'alert_type'
  },
  severity: {
    type: DataTypes.ENUM('INFO', 'WARNING', 'CRITICAL'),
    allowNull: false,
    defaultValue: 'WARNING'
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  currentSpend: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'current_spend'
  },
  budgetLimit: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'budget_limit'
  },
  pacePercentage: {
    type: DataTypes.DECIMAL(5, 2),
    field: 'pace_percentage',
    comment: 'Spending pace as percentage (e.g., 120.5 means 120.5% of expected pace)'
  },
  forecastedSpend: {
    type: DataTypes.DECIMAL(10, 2),
    field: 'forecasted_spend',
    comment: 'Forecasted total spend based on current pace'
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'RESOLVED', 'ACKNOWLEDGED'),
    defaultValue: 'ACTIVE'
  },
  resolvedAt: {
    type: DataTypes.DATE,
    field: 'resolved_at'
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Additional data like campaign name, daily budget, etc.'
  }
}, {
  tableName: 'budget_alerts',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['campaign_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['alert_type']
    },
    {
      fields: ['created_at']
    }
  ]
});

module.exports = BudgetAlert;
