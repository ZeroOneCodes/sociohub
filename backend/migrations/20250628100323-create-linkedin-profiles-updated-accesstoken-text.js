'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('linkedin_profiles', {
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
      sub: {
        type: Sequelize.STRING,
        defaultValue: '',
        allowNull: false
      },
      email_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        defaultValue: '',
        allowNull: false
      },
      given_name: {
        type: Sequelize.STRING,
        defaultValue: '',
        allowNull: false
      },
      family_name: {
        type: Sequelize.STRING,
        defaultValue: '',
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          isEmail: true
        }
      },
      picture: {
        type: Sequelize.STRING, // Long enough for URL
        allowNull: true
      },
      country: {
        type: Sequelize.STRING, // ISO country code
        defaultValue: '',
        allowNull: false
      },
      language: {
        type: Sequelize.STRING, // ISO language code
        defaultValue: '',
        allowNull: false
      },
      access_token: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      refresh_token: {
        type: Sequelize.TEXT,
        allowNull: true
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

    // Add unique index for user_id (one-to-one relationship)
    await queryInterface.addIndex('linkedin_profiles', ['user_id'], {
      unique: true,
      name: 'linkedin_profiles_user_id_unique'
    });

    // Add index for sub (LinkedIn's unique identifier)
    await queryInterface.addIndex('linkedin_profiles', ['sub'], {
      unique: true,
      name: 'linkedin_profiles_sub_unique'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('linkedin_profiles');
  }
};