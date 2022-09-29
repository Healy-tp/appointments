module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('doctors', [
      {
        firstName: 'Peter',
        lastName: 'Doctor',
        specialty: 'Dermatology',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 3,
      },
      {
        firstName: 'Doctor',
        lastName: 'House',
        specialty: 'General',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 4,
      }], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('doctors', null, {});
  },
};
