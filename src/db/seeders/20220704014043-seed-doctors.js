module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('doctors', [
      {
        id: 1,
        firstName: 'Peter',
        lastName: 'Doctor',
        specialty: 'Dermatology',
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 3,
      },
      {
        id: 2,
        firstName: 'Doctor',
        lastName: 'House',
        specialty: 'General',
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 4,
      }], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('doctors', null, {});
  },
};
