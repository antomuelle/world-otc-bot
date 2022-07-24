import MultiOtc from "./src/MultiOtc.js"
import fs from 'fs'
import 'dotenv/config'
import UFBCTT from "./src/UFBCTT.js"

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

const config = JSON.parse(fs.readFileSync('./config.json'))
global.STORE = config.store
for (const key in STORE) {
  if (STORE.hasOwnProperty(key)) {
    (new MultiOtc(key, STORE[key])).login()
  }
}
import './src/server/Server.js'

const credentials = { account: "927448868", password: "s0nsam0sha" }
const app = new UFBCTT(credentials)
app.login()