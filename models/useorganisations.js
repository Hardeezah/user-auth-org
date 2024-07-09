'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserOrganisations = sequelize.define('UserOrganisations', {
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    orgId: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  }, {});
  return UserOrganisations;
};
