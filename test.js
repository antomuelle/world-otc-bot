import 'dotenv/config'
import GoldenDeer from './src/GoldenDeer.js'

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