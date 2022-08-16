import axios from 'axios'
import 'dotenv/config'
import Backend from './src/server/Backend.js'
import PubliExtra from "./src/PubliExtra.js"
import fs from 'fs'
import 'dotenv/config'

Object.prototype.has = function(key) { return this.hasOwnProperty(key) }
Object.prototype.ifHas = function(key, obj, opt_key = null) {
  if (this.hasOwnProperty(key)) {
    opt_key ? obj[opt_key] = this[key] : obj[key] = this[key]
    return true
  }
  return false
}
global._log = function(text) { console.log(text) }
global.randInt = function(min, max) { return Math.floor(Math.random() * (max - min + 1) + min) }

// new Backend()

/* axios.get('https://publiextra.com/a/tareas', { maxRedirects: 0})
  .then( response=> {
    console.log(response)
  }).catch(error=> {
    console.log(error)
  }) */

  const CONFIG = JSON.parse(fs.readFileSync('./config.json'))
  global.STORE = CONFIG.store

  const publi_extra = CONFIG.store.publi_extra
for (const key in publi_extra) {
  if (publi_extra.hasOwnProperty(key))
    ( new PubliExtra(key, publi_extra[key]) ).start()
}