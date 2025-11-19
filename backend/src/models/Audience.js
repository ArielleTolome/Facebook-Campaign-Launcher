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
  type: {
    type: DataTypes.ENUM('SAVED', 'CUSTOM', 'LOOKALIKE'),
    allowNull: false,
    defaultValue: 'SAVED'
  },
  fbAudienceId: {
    type: DataTypes.STRING,
    unique: true,
    field: 'fb_audience_id'
  },
  targeting: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
    comment: 'Facebook targeting specification including demographics, interests, behaviors, locations'
  },
  customAudienceSpec: {
    type: DataTypes.JSONB,
    field: 'custom_audience_spec',
    comment: 'Specification for custom audiences (file source, pixel, app events, etc.)'
  },
  lookalikSpec: {
    type: DataTypes.JSONB,
    field: 'lookalik_spec',
    comment: 'Lookalike audience specification including source audience and similarity'
  },
  estimatedSize: {
    type: DataTypes.INTEGER,
    field: 'estimated_size',
    comment: 'Estimated reach/size of the audience'
  },
  estimatedSizeRange: {
    type: DataTypes.JSONB,
    field: 'estimated_size_range',
    comment: 'Min and max estimated reach'
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'ARCHIVED', 'DELETED'),
    defaultValue: 'ACTIVE'
  },
  templateId: {
    type: DataTypes.UUID,
    field: 'template_id',
    references: {
      model: 'audience_templates',
      key: 'id'
    }
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Additional metadata for custom tracking and organization'
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'Tags for categorization and filtering'
  }
}, {
  tableName: 'audiences',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['type']
    },
    {
      fields: ['status']
    },
    {
      fields: ['template_id']
    },
    {
      using: 'gin',
      fields: ['tags']
    }
  ]
});

module.exports = Audience;
