import 'dotenv/config'
import md5 from "blueimp-md5"
import fs from 'fs'

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
// new Backend()

console.log(md5('NjkmDMZ1M7iZEHjlHOd7T26XgkdiMI' + '19Mrkts11_'))