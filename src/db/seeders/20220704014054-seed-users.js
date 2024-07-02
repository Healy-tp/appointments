const moment = require('moment');

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('users', [{
      firstName: 'Hernan',
      lastName: 'Tain',
      createdAt: moment().toDate(),
      updatedAt: moment().toDate(),
      id: '6a4a9982-0d9d-4e8b-ac9d-e98bd3385124',
    },
    {
      firstName: 'Demo',
      lastName: 'User',
      createdAt: moment().toDate(),
      updatedAt: moment().toDate(),
      id: 'd10e663b-6499-489b-8aa7-297455feac11',
    },
    {
      firstName: 'Demo',
      lastName: 'User 2',
      createdAt: moment().toDate(),
      updatedAt: moment().toDate(),
      id: 'de5b9a94-87c1-48af-aea8-fe6764f8b228',
    },
    ], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', null, {});
  },
};
