module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('offices', [{
      specialties: ['Dermathology', 'Ophthalmology'],
      number: 200,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      specialties: ['Dermathology'],
      number: 201,
      createdAt: new Date(),
      updatedAt: new Date(),
    }], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('offices', null, {});
  },
};
