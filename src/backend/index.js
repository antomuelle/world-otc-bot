import { sequelize } from "./database/relations.js";
await sequelize.sync()
console.log('conectado')