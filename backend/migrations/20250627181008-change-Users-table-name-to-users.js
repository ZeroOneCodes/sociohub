'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameTable('Users', 'users');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameTable('users', 'Users');
  }
};