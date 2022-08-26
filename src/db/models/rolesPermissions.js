const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../dbsetup');

class RolesPermissions extends Model {
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static associate(models) {
    // define association here
  }
}

RolesPermissions.init({
  roleId: DataTypes.INTEGER,
  permissions: DataTypes.STRING,
}, {
  sequelize,
  modelName: 'rolesPermissions',
});

module.exports = { RolesPermissions };
