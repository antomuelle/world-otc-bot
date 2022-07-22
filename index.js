import MultiOtc from "./src/MultiOtc.js"
import MetaClient from "./MetaMe.js"

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

/* const meta_clients = [
  { userName: "antomuell3", pwd: "s0nsam0sha" },
  { userName: "mguzman", pwd: "s0nsam0sha" },
  { userName: "marguzman", pwd: "s0nsam0sha" }
]
for (const client of meta_clients) {
  (new MetaClient(client)).login()
} */

global.STORE = {
  "+51957072446": { "password": "Cr1pt0b3tb0tp@y_" },
  "+51917354727": { "password": "Cr1pt0b3tb0tp@y_" },
  "+584248632054": { "password": "emilysofi19" },
}
for (const key in STORE) {
  if (STORE.hasOwnProperty(key)) {
    (new MultiOtc(key, STORE[key])).login()
  }
}
import './src/server/Server.js'