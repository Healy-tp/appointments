const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../dbsetup');

class User extends Model {
  /*
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static associate(models) {
    this.hasMany(models.Appointments, {
      foreignKey: 'userId',
    });
  }

  getFullname() {
    return [this.firstName, this.lastName].join(' ');
  }
}

User.init({
  firstName: DataTypes.STRING,
  lastName: DataTypes.STRING,
  userId: DataTypes.INTEGER, // This field matches with 'users' service id
}, {
  sequelize,
  tableName: 'users',
  timestamps: true,
  modelName: 'User',
  hooks: {},
});

module.exports = { User };
