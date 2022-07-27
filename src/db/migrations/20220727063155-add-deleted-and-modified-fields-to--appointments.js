const { MAX_APPOINTMENT_UPDATES } = require('../../utils/constants');

module.exports = {
  async up(queryInterface, Sequelize) {
    const tx = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'appointments',
        'timesModifiedByUser',
        {
          type: Sequelize.INTEGER,
          defaultValue: 0,
          validate: {
            max: MAX_APPOINTMENT_UPDATES,
          },
        },
        { tx },
      );
      await queryInterface.addColumn(
        'appointments',
        'deletedAt',
        {
          type: Sequelize.DATE,
          allowNull: true,
        },
        { tx },
      );
      await tx.commit();
    } catch (err) {
      await tx.rollback();
      throw err;
    }
  },
  async down(queryInterface, Sequelize) {
    const tx = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('appointments', 'timesModifiedByUser', { tx });
      await queryInterface.removeColumn('appointments', 'deletedAt', { tx });
      await tx.commit();
    } catch (err) {
      await tx.rollback();
      throw err;
    }
  },
};
