const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Creative = sequelize.define('Creative', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fbCreativeId: {
    type: DataTypes.STRING,
    unique: true,
    field: 'fb_creative_id'
  },
  title: {
    type: DataTypes.STRING
  },
  body: {
    type: DataTypes.TEXT
  },
  imageUrl: {
    type: DataTypes.STRING,
    field: 'image_url'
  },
  videoUrl: {
    type: DataTypes.STRING,
    field: 'video_url'
  },
  linkUrl: {
    type: DataTypes.STRING,
    field: 'link_url'
  },
  callToAction: {
    type: DataTypes.STRING,
    field: 'call_to_action'
  },
  format: {
    type: DataTypes.STRING
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'ARCHIVED'),
    defaultValue: 'ACTIVE'
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
  tableName: 'creatives',
  timestamps: true,
  underscored: true
});

Creative.associate = function(models) {
  Creative.belongsTo(models.AdAccount, { foreignKey: 'adAccountId', as: 'adAccount' });
  Creative.hasMany(models.Ad, { foreignKey: 'creative_id', as: 'ads' });
};

module.exports = Creative;
