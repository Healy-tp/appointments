module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('appointments', {
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
      userId: {
        type: Sequelize.UUID,
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
      notes: {
        type: Sequelize.TEXT('long'),
      },
      assisted: {
        type: Sequelize.BOOLEAN,
      },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('appointments');
  },
};
