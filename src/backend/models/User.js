import { sequelize } from "../database/sequelize.js";
import { DataTypes } from 'sequelize'

export default sequelize.define('User', {
  names: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { notEmpty: true }
  },
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      notEmpty: true,
      isAlphanumeric: true
    }
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: { isEmail: true }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { notEmpty: true }
  }
},
{ tableName: 'users' })