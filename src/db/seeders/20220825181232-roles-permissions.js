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
        permissions: 'EDIT_USERS',
        createdAt: new Date(),
        updatedAt: new Date(),
      }, {
        roleId: 2, // Doctors
        permissions: 'EDIT_DOCTORS',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        roleId: 3, // Admin
        permissions: 'EDIT_USERS|EDIT_DOCTORS',
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
