'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('linkedin_posts', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      post_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        unique: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      linkedin_post_id: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'The URN of the post from LinkedIn API',
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'The content of the LinkedIn post',
      },
      post_created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'When the post was created on LinkedIn',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // For PostgreSQL, create trigger for auto-updating timestamp
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION update_linkedin_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
      
      CREATE TRIGGER update_linkedin_posts_updated_at
      BEFORE UPDATE ON linkedin_posts
      FOR EACH ROW
      EXECUTE FUNCTION update_linkedin_updated_at_column();
    `);

    await queryInterface.addIndex('linkedin_posts', ['user_id']);
    await queryInterface.addIndex('linkedin_posts', ['linkedin_post_id'], {
      unique: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('linkedin_posts');
  }
};