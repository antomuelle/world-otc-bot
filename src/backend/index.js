import * as dotenv from 'dotenv';dotenv.config()
import fs from 'fs'
import https from 'https'
import routes from './routes/routes.js'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import express from 'express'
import expressSession from "express-session";
import ess from 'express-session-sequelize'
import { sequelize } from './database/relations.js';
import passport from './passport.js'
const SessionStore = ess(expressSession.Store)

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PORT = process.env.PORT || 443

// await sequelize.sync({force: true})
// import * as Seeder from './database/seeder.js';
// await Seeder.seed()

const server = express()
server.use(express.json())
server.use(express.urlencoded({ extended: true }))
server.use(expressSession({
  secret: process.env.SESSION_SECRET,
  resave: false,
  store: new SessionStore({ db: sequelize}),
  saveUninitialized: true,
  // cookie: { maxAge: 1000 * 3 }
}))

server.use(passport.initialize())
server.use(passport.session())

server.use('/', routes)

const ssl_path = process.env.NODE_ENV === 'production' ? '/etc/letsencrypt/live/otcworld.ml' : __dirname + '/ssl'

https.createServer({
  key: fs.readFileSync(ssl_path + '/privkey.pem'),
  cert: fs.readFileSync(ssl_path + '/fullchain.pem')
}, server)
  .listen(PORT, ()=> { console.log('server running') })