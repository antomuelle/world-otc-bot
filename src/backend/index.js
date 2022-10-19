import { sequelize } from "./database/relations.js";
import * as Seeder from './database/seeder.js'
import express from 'express'
import fs from 'fs'
import https from 'https'
import routes from './routes/routes.js'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PORT = process.env.PORT || 443

const server = express()
server.use(express.json())
server.use(express.urlencoded({ extended: true }))

server.use('/', routes)

const ssl_path = process.env.NODE_ENV === 'production' ? '/etc/letsencrypt/live/otcworld.ml' : __dirname + '/ssl'

https.createServer({
  key: fs.readFileSync(ssl_path + '/privkey.pem'),
  cert: fs.readFileSync(ssl_path + '/fullchain.pem'),
}, server)
  .listen(PORT, ()=> { console.log('server running') })


// await sequelize.sync({force: true})
// await Seeder.seed()