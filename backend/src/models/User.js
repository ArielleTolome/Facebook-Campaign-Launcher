'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    facebookAccessToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {});
  User.associate = function(models) {
    User.belongsToMany(models.AdAccount, { through: 'UserAdAccount', foreignKey: 'userId', as: 'adAccounts' });
  };
  return User;
};