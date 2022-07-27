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
}

Availability.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  doctorId: DataTypes.INTEGER,
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
    isIn: [FREQUENCIES],
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
