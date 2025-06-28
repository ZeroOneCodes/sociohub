const { DataTypes } = require('sequelize');
const sequelize = require('../dbconfig');

const TwitterProfile = sequelize.define(
  "twitter_profiles",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
      },
    },
    name: {
      type: DataTypes.STRING,
      defaultValue: 'DevZeroOne',
      allowNull: false
    },
    screen_name: {
      type: DataTypes.STRING,
      defaultValue: 'DevZeroOne01',
      allowNull: false
    },
    location: {
      type: DataTypes.STRING,
      defaultValue: '',
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      defaultValue: '',
      allowNull: false
    },
    protected: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    followers_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    friends_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    listed_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    favourites_count: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    statuses_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    lang: {
      type: DataTypes.STRING,
      allowNull: true
    },
    following: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    follow_request_sent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    notifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    translator_type: {
      type: DataTypes.STRING,
      defaultValue: 'none',
      allowNull: false
    },
    suspended: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    needs_phone_verification: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    twitter_token: {
      type: DataTypes.STRING,
      defaultValue: '',
      allowNull: false
    },
    twitter_secret: {
      type: DataTypes.STRING,
      defaultValue: '',
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.NOW,
      field: 'created_at' // Maps to the actual column name in the database
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.NOW,
      field: 'updated_at' // Maps to the actual column name in the database
    }
  },
  {
    tableName: "twitter_profiles",
    timestamps: true, // Enables automatic createdAt and updatedAt handling
    underscored: true, // Converts camelCase to snake_case for field names
    indexes: [
      {
        fields: ['user_id'],
        unique: true
      }
    ]
  }
);

module.exports = TwitterProfile;