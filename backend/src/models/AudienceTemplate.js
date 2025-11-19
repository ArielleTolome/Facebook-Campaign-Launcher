const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AudienceTemplate = sequelize.define('AudienceTemplate', {
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
  category: {
    type: DataTypes.STRING,
    comment: 'Template category (e.g., Demographics, Interests, Behaviors, Custom)'
  },
  type: {
    type: DataTypes.ENUM('SAVED', 'CUSTOM', 'LOOKALIKE'),
    allowNull: false,
    defaultValue: 'SAVED'
  },
  targeting: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
    comment: 'Default targeting configuration for this template'
  },
  customAudienceSpec: {
    type: DataTypes.JSONB,
    field: 'custom_audience_spec',
    comment: 'Template specification for custom audiences'
  },
  lookalikSpec: {
    type: DataTypes.JSONB,
    field: 'lookalik_spec',
    comment: 'Template specification for lookalike audiences'
  },
  configurableFields: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    field: 'configurable_fields',
    defaultValue: [],
    comment: 'Fields that can be customized when creating from template'
  },
  defaultValues: {
    type: DataTypes.JSONB,
    field: 'default_values',
    defaultValue: {},
    comment: 'Default values for configurable fields'
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_public',
    comment: 'Whether this template is available to all users'
  },
  usageCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'usage_count',
    comment: 'Number of times this template has been used'
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'Tags for categorization and search'
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Additional metadata'
  }
}, {
  tableName: 'audience_templates',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['type']
    },
    {
      fields: ['category']
    },
    {
      fields: ['is_public']
    },
    {
      using: 'gin',
      fields: ['tags']
    }
  ]
});

module.exports = AudienceTemplate;
