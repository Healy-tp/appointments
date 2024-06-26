module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('doctors', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        // autoIncrement: true,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
      },
      firstName: Sequelize.STRING,
      lastName: Sequelize.STRING,
      specialty: Sequelize.STRING,
      status: Sequelize.STRING,
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      // userId: { // This field matches the user id in the 'users' service
      //   type: Sequelize.INTEGER,
      //   allowNull: false,
      //   // primaryKey: true,
      //   unique: true,
      // },
    });
    console.log('Successfully ran create doctors migrations');
  },
  async down(queryInterface) {
    await queryInterface.dropTable('doctors');
  },
};
