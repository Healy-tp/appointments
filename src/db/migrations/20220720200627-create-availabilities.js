const { FREQUENCIES, WEEKDAYS } = require('../../utils/constants');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('availabilities', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
      },
      doctorId: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'doctors',
            schema: 'public',
          },
          key: 'id',
        },
        allowNull: false,
      },
      officeId: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'offices',
            schema: 'public',
          },
          key: 'id',
        },
        allowNull: false,
      },
      weekday: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: WEEKDAYS.MONDAY,
          max: WEEKDAYS.SATURDAY,
        },
      },
      startHour: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      endHour: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      frequency: {
        type: Sequelize.INTEGER,
        allowNull: false,
        isIn: [FREQUENCIES],
      },
      validUntil: {
        allowNull: false,
        type: Sequelize.DATEONLY,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      extraAppts: {
        type: Sequelize.INTEGER,
      },
    });
    console.log('Successfully ran create availabilities migrations');
  },
  async down(queryInterface) {
    await queryInterface.dropTable('availabilities');
  },
};
