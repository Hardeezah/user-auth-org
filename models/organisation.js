'use strict';
module.exports = (sequelize, DataTypes) => {
  const Organisation = sequelize.define('Organisation', {
    orgId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: DataTypes.STRING
  }, {});
  Organisation.associate = function(models) {
    Organisation.belongsToMany(models.User, { through: 'UserOrganisations', foreignKey: 'orgId' });
  };
  return Organisation;
};
