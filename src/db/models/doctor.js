const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../dbsetup');

class Doctor extends Model {
  /*
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static associate(models) {
    this.hasMany(models.Appointment, {
      foreignKey: 'doctorId',
    });
    this.hasMany(models.Availability, {
      foreignKey: 'doctorId',
    });
  }

  getFullname() {
    return [this.firstName, this.lastName].join(' ');
  }
}


Doctor.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  firstName: DataTypes.STRING,
  lastName: DataTypes.STRING,
  specialty: DataTypes.STRING,
}, {
  sequelize,
  tableName: 'doctors',
  timestamps: true,
  modelName: 'Doctor',
  hooks: {},
});

module.exports = { Doctor };
