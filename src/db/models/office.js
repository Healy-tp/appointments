const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../dbsetup');

class Office extends Model {
  /*
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static associate(models) {
    this.hasMany(models.Appointments, {
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
  specialties: { type: DataTypes.ARRAY(DataTypes.BIGINT), defaultValue: [] },
}, {
  sequelize,
  tableName: 'offices',
  timestamps: true,
  modelName: 'Office',
  paranoid: true,
  hooks: {},
});

module.exports = { Office };
