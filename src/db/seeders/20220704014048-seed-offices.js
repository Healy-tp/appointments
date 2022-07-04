module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('offices', [{
      id: 1,
      specialties: ['Dermatology', 'Neurology', 'Ophthalmology'],
      createdAt: new Date(),
      updatedAt: new Date(),
    }], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('offices', null, {});
  },
};
