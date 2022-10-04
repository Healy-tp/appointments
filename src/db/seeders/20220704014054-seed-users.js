module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('users', [{
      firstName: 'Hernan',
      lastName: 'Tain',
      createdAt: new Date(),
      updatedAt: new Date(),
      id: 1,
    },
    {
      firstName: 'Demo',
      lastName: 'User',
      createdAt: new Date(),
      updatedAt: new Date(),
      id: 2,
    }], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', null, {});
  },
};
