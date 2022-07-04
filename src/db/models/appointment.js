const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../dbsetup');

class Appointment extends Model {
  /*
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static associate(models) {
    this.belongsTo(models.Doctor, {
      foreignKey: 'doctorId',
    });
    this.belongsTo(models.User, {
      foreignKey: 'userId',
    });
    this.belongsTo(models.Office, {
      foreignKey: 'officeId',
    });
  }

  getFullname() {
    return [this.firstName, this.lastName].join(' ');
  }
}

Appointment.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  doctorId: DataTypes.INTEGER,
  userId: DataTypes.INTEGER,
  officeId: DataTypes.INTEGER,
  arrivalTime: DataTypes.DATE,
  status: DataTypes.STRING,
}, {
  sequelize,
  tableName: 'users',
  timestamps: true,
  modelName: 'Doctor',
  paranoid: true,
  hooks: {},
});

module.exports = { Appointment };
