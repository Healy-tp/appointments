module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('offices', [{
      id: 1,
      specialties: ['Dermatology', 'Neurology', 'Ophthalmology'],
      number: 200,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      specialties: ['Dermatology', 'Neurology'],
      number: 201,
      createdAt: new Date(),
      updatedAt: new Date(),
    }], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('offices', null, {});
  },
};
