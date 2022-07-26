import axios from "axios"
import fs from 'fs'
import dayjs from "dayjs"

export default class BasicBot {
  /** @type {import("axios").AxiosInstance} */
  _axios
  _headers = { 'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Mobile Safari/537.36' }
  _session = { init: false, user_log: '' }
  _credentials
  _timer = null

  constructor(credentials) {
    this._credentials = credentials
  }

  setBaseHeaders(base_url) {
    this._headers.origin = base_url.substring(0, base_url.length - 1)
    this._headers.referer = base_url
  }

  createAxiosInstance(base_url) {
    this._axios = axios.create({
      baseURL: base_url,
      withCredentials: true
    })
    this._axios.interceptors.request.use( (config)=> {
      config.headers = { ...this._headers, ...config.headers }
      return config
    })
  }

  async start() {
    if (this._session.init)
      await this.checkLogin()
    else
      await this.login()
  }

  stop() {
    if (this._timer) {
      clearTimeout(this._timer)
      this._timer = null
    }
  }

  async login() {}

  async checkLogin() {}

  get randomInt() { return randInt(30, 60) }

  get paused() { return !this._timer }

  runTimer(time) {
    let total_time = time + (this.randomInt * 1000)
    this._timer = setTimeout(() => {
      this.checkLogin()
    }, total_time)
    this.logFile('Timer in: ' + this.parseTime(total_time))
  }

  async request(config, intent = 1) {
    if (intent < 1) intent = 1
    while (intent > 0) {
      console.log('whiling request...')
      try {
        return { response: await this._axios(config) }
      } catch (error) {
        intent--
        if (intent <= 0)
          return { error }
      }
    }
  }

  parseTime(time) {
    time = parseInt(time / 1000)
    const h = parseInt(time / 3600)
    const m = parseInt((time % 3600) / 60)
    const s = parseInt(time % 60)
    return `${ h<10?'0'+h:h }:${ m<10?'0'+m:m }:${ s<10?'0'+s:s }`
  }

  log(text) { console.log(`${this.constructor.name} > ${this._session.user_log}: ${text}`) }

  logFile(text) {
    this.log(text)
    let stamp = dayjs().format('YYYY-MM-DD HH:mm:ss')
    stamp = `${stamp} ${this.constructor.name} > ${this._session.user_log}: ${text}\r\n`
    fs.appendFile('./logging.log', stamp, this.void)
  }

  void() {}

}