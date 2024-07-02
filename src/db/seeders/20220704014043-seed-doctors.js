const moment = require('moment');

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('doctors', [
      {
        firstName: 'Demo',
        lastName: 'Doctor LUMIVI',
        specialty: 'Dermatology',
        status: 'active',
        createdAt: moment().toDate(),
        updatedAt: moment().toDate(),
        id: '2435bd1b-3699-407d-b8e3-3664de60a370',
      },
      {
        firstName: 'Demo',
        lastName: 'Doctor MAJUVI',
        specialty: 'General',
        status: 'active',
        createdAt: moment().toDate(),
        updatedAt: moment().toDate(),
        id: 'cc9e10fa-f08b-4606-949b-b0622ea7d91d',
      }], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('doctors', null, {});
  },
};
