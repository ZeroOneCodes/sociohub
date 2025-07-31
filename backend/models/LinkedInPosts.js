const { DataTypes } = require('sequelize');
const sequelize = require('../dbconfig');

const LinkedInPosts = sequelize.define(
  "linkedin_posts",
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
        model: 'users',
        key: 'user_id',
      },
    },
    linkedin_post_id: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'The URN of the post from LinkedIn API',
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'The content of the LinkedIn post',
    },
    post_created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'When the post was created on LinkedIn',
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "linkedin_posts",
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    indexes: [
      {
        fields: ['user_id'],
      },
      {
        fields: ['linkedin_post_id'],
        unique: true,
      },
    ],
  }
);

LinkedInPosts.associate = function(models) {
  LinkedInPosts.belongsTo(models.Users, {
    foreignKey: 'user_id',
    targetKey: 'user_id',
    as: 'user',
  });
};

module.exports = LinkedInPosts;