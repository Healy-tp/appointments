const { Model, DataTypes } = require('sequelize');
const { MAX_APPOINTMENT_UPDATES, APPOINTMENT_STATUS } = require('../../utils/constants');
const { sequelize } = require('../dbsetup');
const { Availability } = require('./availability');

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

  static async getAllAppointmentsForDoctor(doctorId) {
    const appointments = await this.findAll({
      where: {
        doctorId,
      },
    });
    return appointments;
  }
}

Appointment.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  doctorId: {
    type: DataTypes.INTEGER,
  },
  userId: DataTypes.INTEGER,
  officeId: DataTypes.INTEGER,
  arrivalTime: DataTypes.DATE,
  status: {
    type: DataTypes.STRING,
    validate: {
      isIn: [[
        APPOINTMENT_STATUS.ATTENDED,
        APPOINTMENT_STATUS.CANCELLED,
        APPOINTMENT_STATUS.CONFIRMED,
        APPOINTMENT_STATUS.TO_CONFIRM,
      ]],
    },
  },
  timesModifiedByUser: {
    type: DataTypes.INTEGER,
    validate: {
      max: MAX_APPOINTMENT_UPDATES,
    },
    defaultValue: 0,
  },
  notes: {
    type: DataTypes.TEXT('long'),
  },
  extraAppt: {
    type: DataTypes.DATEONLY,
    validate: {
      async spotsAvailable(value) {
        const av = await Availability.findOne({
          where: {
            doctorId: this.doctorId,
            weekday: new Date(value).getDay(),
          },
        });
        const appts = await Appointment.findAll({
          where: {
            extraAppt: value,
            doctorId: this.doctorId,
          },
        });

        if (appts.length >= av.extraAppts) {
          throw new Error('No more extra spots available for selected date');
        }
      },
    },
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
