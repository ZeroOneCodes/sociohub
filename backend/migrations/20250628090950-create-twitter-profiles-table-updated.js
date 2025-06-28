'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('twitter_profiles', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING,
        defaultValue: 'DevZeroOne',
        allowNull: false
      },
      screen_name: {
        type: Sequelize.STRING,
        defaultValue: 'DevZeroOne01',
        allowNull: false
      },
      location: {
        type: Sequelize.STRING,
        defaultValue: '',
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        defaultValue: '',
        allowNull: false
      },
      protected: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      followers_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      friends_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      listed_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      favourites_count: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        allowNull: false
      },
      verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      statuses_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      lang: {
        type: Sequelize.STRING,
        allowNull: true
      },
      following: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      follow_request_sent: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      notifications: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      translator_type: {
        type: Sequelize.STRING,
        defaultValue: 'none',
        allowNull: false
      },
      suspended: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      needs_phone_verification: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false
      },
      twitter_token: {
        type: Sequelize.STRING,
        defaultValue: '',
        allowNull: false
      },
      twitter_secret: {
        type: Sequelize.STRING,
        defaultValue: '',
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now')
      }
    });

    // Add index for user_id for faster queries
    await queryInterface.addIndex('twitter_profiles', ['user_id'], {
      unique: true,
      name: 'twitter_profiles_user_id_unique'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('twitter_profiles');
  }
};