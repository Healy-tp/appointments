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
}

Availability.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  doctorId: {
    type: DataTypes.INTEGER,
    // references: {
    //   model: Doctor,
    //   key: 'userId',
    // },
  },
  officeId: DataTypes.INTEGER,
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
}, {
  sequelize,
  tableName: 'availabilities',
  timestamps: true,
  modelName: 'Availability',
  hooks: {},
});

module.exports = { Availability };
