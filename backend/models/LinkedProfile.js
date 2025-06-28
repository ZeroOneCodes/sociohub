const { DataTypes } = require('sequelize');
const sequelize = require('../dbconfig');

const LinkedInProfile = sequelize.define(
  "linkedin_profiles",
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
      }
    },
    sub: {
      type: DataTypes.STRING,
      defaultValue: '',
      allowNull: false,
      unique: true
    },
    email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      defaultValue: '',
      allowNull: false
    },
    given_name: {
      type: DataTypes.STRING,
      defaultValue: '',
      allowNull: false
    },
    family_name: {
      type: DataTypes.STRING,
      defaultValue: '',
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    picture: {
      type: DataTypes.STRING,
      allowNull: true
    },
    country: {
      type: DataTypes.STRING,
      defaultValue: '',
      allowNull: false
    },
    language: {
      type: DataTypes.STRING,
      defaultValue: '',
      allowNull: false
    },
    access_token: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    refresh_token: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.NOW,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.NOW,
      field: 'updated_at'
    }
  },
  {
    tableName: "linkedin_profiles",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['user_id'],
        unique: true
      },
      {
        fields: ['sub'],
        unique: true
      }
    ]
  }
);

module.exports = LinkedInProfile;