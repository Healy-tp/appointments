const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../dbsetup');

class Office extends Model {
  /*
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static associate(models) {
    this.hasMany(models.Appointment, {
      foreignKey: 'officeId',
    });
    this.hasMany(models.Availability, {
      foreignKey: 'officeId',
    });
  }
}

Office.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  specialties: { type: DataTypes.ARRAY(DataTypes.CHAR), defaultValue: [] },
  number: DataTypes.INTEGER,
}, {
  sequelize,
  tableName: 'offices',
  timestamps: true,
  modelName: 'Office',
  hooks: {},
});

module.exports = { Office };
