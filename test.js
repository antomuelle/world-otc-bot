import 'dotenv/config'
import fs from 'fs'
import UFBCT from './src/UFBCT.js'

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

const CONFIG = JSON.parse(fs.readFileSync('./config.json'))
global.STORE = CONFIG.store
/*********** start from here **********/

const ufbc = new UFBCT("928526604", { "password": "Bambam28", "instance": null })
await ufbc.login()
ufbc.getBalance()