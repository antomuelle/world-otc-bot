import 'dotenv/config'
import GoldenDeer from './src/GoldenDeer.js'
import PamoMined from './src/PamoMined.js'
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

/* import dayjs from "dayjs"
import utc from 'dayjs/plugin/utc.js'
import timezone from 'dayjs/plugin/timezone.js'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'

const FORMAT = 'MM-DD HH:mm'
const TIME_ZONE = 'America/Caracas'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customParseFormat)

const start = dayjs(1662670959000)
const end = dayjs(1662681759000)
//console.log(start.format(FORMAT), end.format(FORMAT))

const now = dayjs()
//const after = dayjs.tz(1662681759000, FORMAT, TIME_ZONE)
const after = dayjs(1662681759000)
console.log(after.diff(now) / 1000 / 60) */

/* const portion = `</div>
<div class="col-auto">
<div class="dropdown d-inline-block">
<button type="button" disabled class="text-secondary dd-arrow-none comprarlo" id="rentin_2" onclick="anadir_renta('2','oqjntbkh_520')">
EXTRAER
</button>
</div>
</div>
<div class="col-12">`;

function find() {
  let found = "anadir_renta('"
  let start = portion.indexOf(found) + found.length
  const id = portion.substring(start, portion.indexOf("'", start))
  start = portion.indexOf("'", start + id.length + 1) + 1
  const code = portion.substring(start, portion.indexOf("'", start))
  return id +',' + code
}

console.log(Math.random()) */

const pamo_mined = CONFIG.store.pamo_mined
for (const key in pamo_mined) {
  if (pamo_mined.hasOwnProperty(key))
    ( new PamoMined(key, pamo_mined[key]) ).start()
}