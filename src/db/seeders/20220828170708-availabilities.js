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
      id: '53d7de49-dd26-4ef5-9dc0-244d74acc01b',
      doctorId: '2435bd1b-3699-407d-b8e3-3664de60a370',
      officeId: '71c5dfaa-03ff-4016-bdba-8c47a7d31287',
      weekday: 1,
      startHour: '13:00',
      endHour: '16:00',
      frequency: 60,
      validUntil: new Date(2023, 11, 1),
      createdAt: new Date(),
      updatedAt: new Date(),
      extraAppts: 5,
    },
    {
      id: '19006a96-2aa3-4bdd-bac1-905c12ba87c6',
      doctorId: '2435bd1b-3699-407d-b8e3-3664de60a370',
      officeId: '71c5dfaa-03ff-4016-bdba-8c47a7d31287',
      weekday: 3,
      startHour: '13:00',
      endHour: '16:00',
      frequency: 15,
      validUntil: new Date(2023, 11, 1),
      createdAt: new Date(),
      updatedAt: new Date(),
      extraAppts: 5,
    },
    {
      id: 'ff61c4a4-3a25-466e-aff6-df5d30c6a877',
      doctorId: '2435bd1b-3699-407d-b8e3-3664de60a370',
      officeId: '71c5dfaa-03ff-4016-bdba-8c47a7d31287',
      weekday: 5,
      startHour: '13:00',
      endHour: '16:00',
      frequency: 30,
      validUntil: new Date(2023, 11, 1),
      createdAt: new Date(),
      updatedAt: new Date(),
      extraAppts: 5,
    },
    {
      id: '610dfc4e-2a53-4f7f-b2b7-7e080def508f',
      doctorId: 'cc9e10fa-f08b-4606-949b-b0622ea7d91d',
      officeId: '103c860b-ed2c-4d6f-b9b3-21177022d3c9',
      weekday: 2,
      startHour: '10:00',
      endHour: '16:00',
      frequency: 30,
      validUntil: new Date(2023, 11, 1),
      createdAt: new Date(),
      updatedAt: new Date(),
      extraAppts: 5,
    },
    {
      id: 'e46a99fe-f113-4aab-b464-e0834e5de7db',
      doctorId: 'cc9e10fa-f08b-4606-949b-b0622ea7d91d',
      officeId: '71c5dfaa-03ff-4016-bdba-8c47a7d31287',
      weekday: 4,
      startHour: '10:00',
      endHour: '16:00',
      frequency: 15,
      validUntil: new Date(2023, 11, 1),
      createdAt: new Date(),
      updatedAt: new Date(),
      extraAppts: 5,
    },
    {
      id: '36f3c956-0997-4ad2-a8d0-9fe6aa807719',
      doctorId: 'cc9e10fa-f08b-4606-949b-b0622ea7d91d',
      officeId: '103c860b-ed2c-4d6f-b9b3-21177022d3c9',
      weekday: 5,
      startHour: '10:00',
      endHour: '16:00',
      frequency: 15,
      validUntil: new Date(2023, 11, 1),
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
