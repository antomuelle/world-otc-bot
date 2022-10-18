import { sequelize } from "./database/relations.js";
import * as Seeder from './database/seeder.js'

await sequelize.sync({force: true})
await Seeder.seed()
console.log('sync and seed')