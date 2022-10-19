import { sequelize } from "../database/sequelize.js";
import { DataTypes } from 'sequelize'

export default sequelize.define('Platform', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  base_url: {
    type: DataTypes.STRING,
    defaultValue: null,
    validate: { isUrl: true }
  },
  web_url: {
    type: DataTypes.STRING,
    defaultValue: null,
    validate: { isUrl: true }
  },
  referral_url: {
    type: DataTypes.STRING,
    defaultValue: null,
    validate: { isUrl: true }
  },
  root_user: {
    type: DataTypes.STRING,
    defaultValue: null,
    validate: { notEmpty: true }
  },
  root_pass: {
    type: DataTypes.STRING,
    defaultValue: null,
    validate: { notEmpty: true }
  },
  active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: 1,
  },
  details: {
    type: DataTypes.JSON,
    defaultValue: null
  }
},
{
  tableName: 'platforms',
  createdAt: 'created_at',
  updatedAt: 'updated_at'
})