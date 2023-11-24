const { Model, DataTypes } = require('sequelize');
const { WEEKDAYS, FREQUENCIES } = require('../../utils/constants');
const { sequelize } = require('../dbsetup');

class Availability extends Model {
  /*
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static associate(models) {
    this.belongsTo(models.Doctor, {
      foreignKey: 'doctorId',
    });
    this.belongsTo(models.Office, {
      foreignKey: 'officeId',
    });
  }

  static async getAllSlots(dt, oid) {
    const dates = [];
    const dateString = dt.toJSON().slice(0, 10);
    const av = await this.findOne({
      where: {
        weekday: dt.getDay(),
        officeId: oid,
      },
    });

    if (!av || dt > new Date(av.validUntil)) {
      return dates;
    }

    const startDt = new Date(`${dateString} ${av.startHour.slice(0, 5)}`);
    const endDt = new Date(`${dateString} ${av.endHour.slice(0, 5)}`);

    while (startDt < endDt) {
      dates.push(new Date(startDt).getTime());
      startDt.setMinutes(startDt.getMinutes() + av.frequency);
    }

    return dates;
  }

  static getClosestDateToWeekday(weekday) {
    const startDate = new Date();
    while (startDate.getDay() !== weekday) {
      startDate.setDate(startDate.getDate() + 1);
    }
    return startDate;
  }

  static getSlotsBetweenTwoHours(startDtStr, av) {
    const slots = [];
    const startDt = new Date(`${startDtStr} ${av.startHour.slice(0, 5)}`);
    const endDt = new Date(`${startDtStr} ${av.endHour.slice(0, 5)}`);

    while (startDt < endDt) {
      slots.push(new Date(startDt));
      startDt.setMinutes(startDt.getMinutes() + av.frequency);
    }

    return slots;
  }

  static async getAllAvailableSlotsForDoctor(doctorId) {
    const availabilities = await this.findAll({
      where: {
        doctorId,
      },
    });

    const offices = {};
    availabilities.forEach((a) => {
      offices[a.weekday] = a.officeId;
    });

    const allAvailableSlotsForSpecificWeekday = [];
    const validUntils = {};
    availabilities.forEach((av) => {
      const startDt = this.getClosestDateToWeekday(av.weekday);
      const slots = this.getSlotsBetweenTwoHours(startDt.toJSON().slice(0, 10), av);
      allAvailableSlotsForSpecificWeekday.push(...slots);
      validUntils[av.weekday] = new Date(av.validUntil);
    });

    const allAvailableSlots = [];
    allAvailableSlotsForSpecificWeekday.forEach((ad) => {
      while (ad < validUntils[ad.getDay()]) {
        allAvailableSlots.push(new Date(ad));
        ad.setDate(ad.getDate() + 7);
      }
    });

    const response = allAvailableSlots.filter((a) => a > new Date());

    return [response.sort((o1, o2) => {
      if (o1 < o2) return -1;
      else if (o2 > o1) return 1;
      return 0;
    }), offices];
  }

  static async getAvailableExtraAppointments(doctorId) {
    const availabilities = await this.findAll({
      where: {
        doctorId,
      },
    });

    const extraApptsByDay = {};
    availabilities.forEach((av) => {
      const startDt = this.getClosestDateToWeekday(av.weekday);
      const validUntilDt = new Date(av.validUntil);
      while (startDt < validUntilDt) {
        extraApptsByDay[new Date(startDt.toJSON().slice(0, 10)).getTime()] = av.extraAppts;
        startDt.setDate(startDt.getDate() + 7);
      }
    });
    return extraApptsByDay;
  }
}

Availability.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  doctorId: {
    type: DataTypes.UUID,
    // references: {
    //   model: Doctor,
    //   key: 'userId',
    // },
  },
  officeId: DataTypes.UUID,
  weekday: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: WEEKDAYS.MONDAY,
      max: WEEKDAYS.SATURDAY,
    },
  },
  startHour: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  endHour: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  frequency: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      isIn: [FREQUENCIES],
    },
  },
  validUntil: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  extraAppts: {
    type: DataTypes.INTEGER,
  },
}, {
  sequelize,
  tableName: 'availabilities',
  timestamps: true,
  modelName: 'Availability',
  hooks: {},
});

module.exports = { Availability };
