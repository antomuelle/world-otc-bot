import Account from "../models/Account.js";
import Platform from "../models/Platform.js";
import User from  "../models/User.js";

User.belongsToMany(Platform, { through: Account })
Platform.belongsToMany(User, { through: Account })

// import { sequelize as conn } from "./sequelize.js";
// export const sequelize = conn
export { sequelize } from './sequelize.js'