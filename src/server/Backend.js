import express from "express"
import fs from 'fs'
import https from 'https'
import session from 'express-session'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PORT = process.env.PORT || 443

export default class Backend {
  _server

  constructor() {
    let options = {}
    if (process.env.NODE_ENV === 'production')
      options = {
        key: fs.readFileSync('/etc/letsencrypt/live/otcworld.ml/privkey.pem'),
        cert: fs.readFileSync('/etc/letsencrypt/live/otcworld.ml/fullchain.pem')
      }
    else
      options = {
        key: fs.readFileSync(__dirname + '/ssl/key.pem'),
        cert: fs.readFileSync(__dirname + '/ssl/cert.pem')
      }
    const app = express()
    app.use(express.json())
    app.use(express.urlencoded({extended: true}))
    app.use(session({
      secret: process.env.SECRET,
      resave: false,
      saveUninitialized: true
    }))
    
    https.createServer(options, app)
      .listen(PORT, ()=> { console.log('Server on: http://localhost:' + PORT)})
    this._server = app
  }
}