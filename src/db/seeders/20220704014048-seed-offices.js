const moment = require('moment');

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('offices', [{
      id: '71c5dfaa-03ff-4016-bdba-8c47a7d31287',
      specialties: ['Dermathology', 'Ophthalmology'],
      number: 200,
      createdAt: moment().toDate(),
      updatedAt: moment().toDate(),
    },
    {
      id: '103c860b-ed2c-4d6f-b9b3-21177022d3c9',
      specialties: ['Dermathology'],
      number: 201,
      createdAt: moment().toDate(),
      updatedAt: moment().toDate(),
    }], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('offices', null, {});
  },
};
