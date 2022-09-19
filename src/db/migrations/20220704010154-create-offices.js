module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('offices', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      specialties: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: [],
      },
      number: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('offices');
  },
};
