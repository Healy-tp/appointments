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
    await queryInterface.bulkInsert('rolesPermissions', [
      {
        roleId: 1, // Users
        permissions: 'GET_APPTS|EDIT_APPTS|DELETE_APPTS|CREATE_APPT|START_CHAT|GET_HISTORY',
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        roleId: 2, // Doctors
        permissions: 'GET_OFFICES|GET_AVAILABILITY_BY_DOC_ID|CREATE_AVAILABILITY|GET_APPTS|EDIT_APPTS|START_CHAT|DOCTOR_CANCELATION|EDIT_NOTES|GET_HISTORY',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 3, // Admin
        permissions: 'GET_OFFICES|CREATE_AVAILABILITY|GET_APPTS|EDIT_APPTS|CREATE_APPT|CREATE_OFFICE|EDIT_AVAILABILITY|EDIT_OFFICE',
        createdAt: new Date(),
        updatedAt: new Date(),
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
