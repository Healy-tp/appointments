module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        // autoIncrement: true,
        allowNull: false,
        // unique: true,
      },
      firstName: Sequelize.STRING,
      lastName: Sequelize.STRING,
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
      //   unique: true,
      //   // primaryKey: true,
      // },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('users');
  },
};
