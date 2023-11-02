module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('users', [{
      firstName: 'Hernan',
      lastName: 'Tain',
      createdAt: new Date(),
      updatedAt: new Date(),
      id: '6a4a9982-0d9d-4e8b-ac9d-e98bd3385124',
    },
    {
      firstName: 'Demo',
      lastName: 'User',
      createdAt: new Date(),
      updatedAt: new Date(),
      id: 'd10e663b-6499-489b-8aa7-297455feac11',
    }], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', null, {});
  },
};
