const { DataTypes } = require('sequelize');
const sequelize = require('../dbconfig');

const TwitterPosts = sequelize.define(
  "twitter_posts",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    post_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users', // This references the 'users' table
        key: 'user_id',  // This references the 'user_id' column in the 'users' table
      },
    },
    twitter_post_id: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'The ID of the post from Twitter API',
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'The content of the Twitter post',
    },
    post_created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'When the post was created on Twitter',
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.NOW,
    },
  },
  {
    tableName: "twitter_posts",
    timestamps: true,
    // Map Sequelize's default timestamp fields to your snake_case columns
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['user_id'],
      },
      {
        fields: ['twitter_post_id'],
        unique: true,
      },
    ],
  }
);

TwitterPosts.associate = function(models) {
  TwitterPosts.belongsTo(models.Users, {
    foreignKey: 'user_id',
    targetKey: 'user_id',
    as: 'user',
  });
};

module.exports = TwitterPosts;