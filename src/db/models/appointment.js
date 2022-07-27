const { Model, DataTypes } = require('sequelize');
const { MAX_APPOINTMENT_UPDATES } = require('../../utils/constants');
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
  timesModifiedByUser: {
    type: DataTypes.INTEGER,
    validate: {
      max: MAX_APPOINTMENT_UPDATES,
    },
    defaultValue: 0,
  },
}, {
  sequelize,
  tableName: 'appointments',
  paranoid: true,
  timestamps: true,
  modelName: 'Appointment',
  hooks: {},
});

module.exports = { Appointment };
