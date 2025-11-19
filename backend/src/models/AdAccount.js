'use strict';
module.exports = (sequelize, DataTypes) => {
  const AdAccount = sequelize.define('AdAccount', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    facebookAccountId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
    },
  }, {});
  AdAccount.associate = function(models) {
    AdAccount.belongsToMany(models.User, { through: 'UserAdAccount', foreignKey: 'adAccountId', as: 'users' });
  };
  return AdAccount;
};