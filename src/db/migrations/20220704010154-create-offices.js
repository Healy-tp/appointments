module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('offices', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
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
    console.log('Successfully ran create offices migrations');
  },
  async down(queryInterface) {
    await queryInterface.dropTable('offices');
  },
};
