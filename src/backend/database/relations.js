import Account from "../models/Account.js";
import Platform from "../models/Platform.js";
import User from  "../models/User.js";

User.belongsToMany(Platform, { through: { model: Account, unique: false }, foreignKey: 'user_id', otherKey: 'platform_id', unique: false })
Platform.belongsToMany(User, { through: { model: Account, unique: false }, foreignKey: 'platform_id', otherKey: 'user_id', unique: false })
/* User.belongsToMany(Platform, { through: { model: Account, unique: false } })
Platform.belongsToMany(User, { through: { model: Account, unique: false } }) */

// export { sequelize } from './sequelize.js'
export const sequelize = User.sequelize