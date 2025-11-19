const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Creative = require('./Creative');

const CreativePerformance = sequelize.define('CreativePerformance', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  creativeId: {
    type: DataTypes.UUID,
    references: {
      model: Creative,
      key: 'id'
    },
    allowNull: false,
    field: 'creative_id'
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  impressions: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  clicks: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  conversions: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  cost: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  }
}, {
  tableName: 'creative_performances',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['creative_id', 'date']
    }
  ]
});

module.exports = CreativePerformance;
