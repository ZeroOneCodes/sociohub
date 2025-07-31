'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('twitter_posts', {
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
      twitter_post_id: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'The ID of the post from Twitter API',
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'The content of the Twitter post',
      },
      post_created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'When the post was created on Twitter',
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

    // For PostgreSQL, you need to create a trigger for auto-updating the timestamp
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
      
      CREATE TRIGGER update_twitter_posts_updated_at
      BEFORE UPDATE ON twitter_posts
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);

    await queryInterface.addIndex('twitter_posts', ['user_id']);
    await queryInterface.addIndex('twitter_posts', ['twitter_post_id'], {
      unique: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('twitter_posts');
  }
};