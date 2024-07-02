const { Model, DataTypes, Op, fn } = require('sequelize');
const moment = require('moment');

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

  canStartChat() {
    const date = this.arrivalTime || this.extraAppt;
    // const now = new Date();
    return (
      moment().isSameOrBefore(date)
        ? moment(now).isSameOrAfter(moment(date).subtract(7, 'days'))
        : moment(now).isSameOrBefore(moment(date).add(15, 'days'))
    );
  }

  static async rescheduleAppointment(doctorId, transaction) {
    const unavailableSlots = {};
    const appointments = await this.getAllAppointmentsForDoctor(doctorId, transaction);
    appointments.forEach((ap) => {
      unavailableSlots[ap.arrivalTime.getTime()] = true;
    });

    const [availabilities, offices] = await Availability.getAllAvailableSlotsForDoctor(doctorId, transaction);
    let newDate;
    availabilities.every((a) => {
      if (!unavailableSlots[a.getTime()]) {
        newDate = a;
        return false;
      }
      return true;
    });
    return [newDate, offices];
  }

  static async rescheduleAppointmentUsingExtraSlots(doctorId, transaction) {
    const extraApptsAvailable = await Availability.getAvailableExtraAppointments(doctorId, transaction);
    const extraAppts = await this.getAllExtraAppointmentsForDoctor(doctorId, transaction);
    extraAppts.forEach((a) => {
      const x = new Date(a.dataValues.extraAppt);
      extraApptsAvailable[x.getTime()] = extraApptsAvailable[x.getTime()] - a.dataValues.count;
    });
    let newDate;
    let isExtra;
    const sortedKeys = Object.keys(extraApptsAvailable).sort();
    sortedKeys.every((k) => {
      if (extraApptsAvailable[k] > 0) {
        newDate = new Date(parseInt(k));
        isExtra = true;
        return false;
      }
      return true;
    });
    return [newDate, isExtra];
  }

  static async getAllAppointmentsForDoctor(doctorId, transaction) {
    const appointments = await this.findAll({
      where: {
        doctorId,
        extraAppt: null,
      },
      transaction
    });
    return appointments;
  }

  static async getAllExtraAppointmentsForDoctor(doctorId, transaction) {
    const appointments = await this.findAll({
      attributes: ['extraAppt', [fn('COUNT', 'id'), 'count']],
      where: {
        doctorId,
        extraAppt: {
          [Op.ne]: null,
        },
      },
      group: ['extraAppt'],
      order: [['extraAppt', 'ASC']],
      transaction,
    });
    return appointments;
  }
}

Appointment.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  doctorId: {
    type: DataTypes.UUID,
  },
  userId: DataTypes.UUID,
  officeId: DataTypes.UUID,
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
  assisted: {
    type: DataTypes.BOOLEAN,
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
