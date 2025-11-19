const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ad = sequelize.define('Ad', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  adSetId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'ad_set_id'
  },
  creativeId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'creative_id'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fbAdId: {
    type: DataTypes.STRING,
    unique: true,
    field: 'fb_ad_id'
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'PAUSED', 'DELETED', 'ARCHIVED'),
    defaultValue: 'PAUSED'
  }
}, {
  tableName: 'ads',
  timestamps: true,
  underscored: true
});

module.exports = Ad;
