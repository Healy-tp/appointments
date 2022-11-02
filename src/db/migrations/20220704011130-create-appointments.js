module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('appointments', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      doctorId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'doctors',
            schema: 'public',
          },
          key: 'id',
        },
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'users',
            schema: 'public',
          },
          key: 'id',
        },
        allowNull: false,
      },
      officeId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'offices',
            schema: 'public',
          },
          key: 'id',
        },
        allowNull: false,
      },
      arrivalTime: Sequelize.DATE,
      status: {
        type: Sequelize.STRING,
        validate: {
          isIn: [['confirmed', 'to_confirm', 'attended', 'cancelled']],
        },
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      extraAppt: {
        type: Sequelize.DATEONLY,
      },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('appointments');
  },
};
