import { sequelize } from "../database/sequelize.js";
import { DataTypes } from 'sequelize'
import User from "./User.js";
import Platform from "./Platform.js";

export default sequelize.define('Account', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  platform_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Platform,
      key: 'id'
    }
  }
},
{ tableName: 'accounts' })