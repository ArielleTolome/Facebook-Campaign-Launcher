const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Audience = sequelize.define('Audience', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  fbAudienceId: {
    type: DataTypes.STRING,
    unique: true,
    field: 'fb_audience_id'
  },
  audienceType: {
    type: DataTypes.ENUM('SAVED', 'CUSTOM', 'LOOKALIKE'),
    allowNull: false,
    defaultValue: 'SAVED',
    field: 'audience_type'
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'ARCHIVED', 'DELETED'),
    defaultValue: 'ACTIVE'
  },
  targeting: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
    comment: 'Targeting criteria: age, gender, locations, interests, behaviors, etc.'
  },
  size: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Estimated audience size data from Facebook'
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Additional metadata like tags, category, etc.'
  },
  createdBy: {
    type: DataTypes.STRING,
    field: 'created_by'
  }
}, {
  tableName: 'audiences',
  timestamps: true,
  underscored: true
});

module.exports = Audience;
