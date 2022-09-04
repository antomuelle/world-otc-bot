import MultiOtc from "./src/MultiOtc.js"
import UFBCT from "./src/UFBCT.js"
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

const CONFIG = JSON.parse(fs.readFileSync('./config.json'))
global.STORE = CONFIG.store

const world_otc = CONFIG.store.world_otc
for (const key in world_otc) {
  if (world_otc.hasOwnProperty(key)) {
    ( new MultiOtc(key, world_otc[key]) ).login()
  }
}

const ufbc = CONFIG.store.ufbc
for (const key in ufbc) {
  if (ufbc.hasOwnProperty(key))
    ( new UFBCT(key, ufbc[key]) ).start()
}

const popts = CONFIG.store.popts
for (const key in popts) {
  if (popts.hasOwnProperty(key))
    ( new UFBCT(key, popts[key], 'https://api.popts.vip/api/') ).start()
}

/* const publi_extra = CONFIG.store.publi_extra
for (const key in publi_extra) {
  if (publi_extra.hasOwnProperty(key))
    ( new PubliExtra(key, publi_extra[key]) ).start()
} */

import './src/server/Server.js'