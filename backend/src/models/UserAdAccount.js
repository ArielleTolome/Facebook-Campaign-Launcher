'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserAdAccount = sequelize.define('UserAdAccount', {
    userId: {
      type: DataTypes.UUID,
      references: {
        model: 'Users',
        key: 'id'
      },
      primaryKey: true,
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    adAccountId: {
      type: DataTypes.UUID,
      references: {
        model: 'AdAccounts',
        key: 'id'
      },
      primaryKey: true,
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    }
  }, {});
  UserAdAccount.associate = function(models) {
    // associations can be defined here
  };
  return UserAdAccount;
};