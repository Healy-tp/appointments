'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await queryInterface.bulkInsert('availabilities', [{
      doctorId: 3,
      officeId: 1,
      weekday: 2,
      startHour: '13:00',
      endHour: '16:00',
      frequency: 60,
      validUntil: new Date(2022, 11, 1),
      createdAt: new Date(),
      updatedAt: new Date(),
      extraAppts: 5,
    },
    {
      doctorId: 4,
      officeId: 2,
      weekday: 4,
      startHour: '10:00',
      endHour: '16:00',
      frequency: 30,
      validUntil: new Date(2022, 11, 1),
      createdAt: new Date(),
      updatedAt: new Date(),
      extraAppts: 5,
    },
    {
      doctorId: 4,
      officeId: 1,
      weekday: 5,
      startHour: '10:00',
      endHour: '16:00',
      frequency: 15,
      validUntil: new Date(2022, 11, 1),
      createdAt: new Date(),
      updatedAt: new Date(),
      extraAppts: 5,
    }], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
