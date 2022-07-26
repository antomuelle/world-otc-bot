import { connection } from "../database/connection.js";
import { DataTypes } from 'sequelize'
import User from "./User.js";
import Platform from "./Platform.js";

export default connection.define('Account', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  platform_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: false,
    references: {
      model: Platform,
      key: 'id'
    }
  },
  username: {
    type: DataTypes.STRING,
    defaultValue: null,
    validate: {
      notEmpty: true,
      isAlphanumeric: true
    }
  },
  password: {
    type: DataTypes.STRING,
    defaultValue: null,
    validate: { notEmpty: true }
  },
  session: {
    type: DataTypes.JSON,
    defaultValue: null
  },
  active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: 0
  }
},
{
  tableName: 'accounts',
  createdAt: 'created_at',
  updatedAt: 'updated_at'
})