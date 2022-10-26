/** @typedef { import('../models/Account.js').default } Account */
/** @typedef { import('../models/User.js').default } User */
/** @typedef { import('axios').AxiosInstance } axios */
import axios from 'axios'
import { EventEmitter } from 'events'
import dayjs from 'dayjs'
import fs from 'fs'
import { parseTime, randomInt } from '../utils'

const BASE_URL = 'https://api.uftp.vip/api/'
const LOGIN_URL = 'user/login'
const START_MINE = 'shop/pair'
const RUSH_INFO = 'shop/getShopList'
const PREVIEW_MINE = 'shop/showShop'

export default class extends EventEmitter {
  _headers = {
    referer: 'https://www.uftp.vip/',
    origin: 'https://www.uftp.vip',
    token: TOKEN,
    'sec-ch-ua-platform': 'Android',
    'sec-ch-ua-mobile': '?1',
    'sec-ch-ua': '"Chromium";v="106", "Google Chrome";v="106", "Not;A=Brand";v="99"',
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Mobile Safari/537.36',
  }
  /** @type {User} */
  _user
  /** @type {Account} */
  _account
  /** @type {axios} */
  _axios

  constructor(user, account) {
    this._user = user
    this._account = account
    this._headers.token = account.session.token
    this.createAxiosInstance(BASE_URL)
  }

  start() {}
  stop() {}

  async login() {
    const account = this._account
    try {
      const { data } = await this._axios.get('', { data: {
        area: account.session.area,
        account: account.username,
        password: account.password
      }})
      if (data.code && data.code === 1) {
        const token = data.data.userinfo.token
        account.session.token = token
        await account.save()
        this.emit('token:updated', token)
        this.checkLogin()
        // account.update({ session: { ...account.session, token }})
      }
    }
    catch (error) {}
  }

  destroy = ()=> {
    this._axios = null
    this._user = null,
    this._account = null
  }

  async checkLogin() {
    try {
      const { data } = await this._axios.post(RUSH_INFO)
      if (data.code && data.code === 1) {
        const balance = data.data.extend
        if (Number(balance.money) >= 5) {
          this.startMiner()
        } else if (Number(balance.order_lock_money) > 0) {
          let last_rush = data.data.list
          if (Array.isArray(last_rush) && last_rush.length > 0) {
            last_rush = last_rush[0]
            const now = dayjs(Number(data.time + '000'))
            const end = dayjs(Number(last_rush.end_time + '000'))
            const diff = end.diff(now)
            if (diff > 0) {
              this.logFile('seteando timer para el rush')
              this.runTimer(diff)
            }
            else {
              this.logFile('money lock pero con diferencia negativa, intentando en:')
              this.runTimer(10000)
            }
          }
          else { this.logFile('last_rush no es arrary o esta vacio: ' + JSON.stringify(data.data.list))}
        }
        else {
          this.logFile('balance insuficiente, intentare en 2 horas')
          this.runTimer(HOUR * 2)
        }
      }
    }
    catch (error) {
      if (error.response) {
        const data = error.response.data
        if (data) {
          // if data.code = 401 -> iniciar sesion
        }
      }
    }

  }

  async startMiner() {
    try {
      let { data } = await this._axios.post(PREVIEW_MINE)
      if (data.code && data.code <= 0)
        throw new Error(data.msg || 'error en PREVIEW_MINE')
      else
        this.logFile('preview ok, data: '+data)

      data = (await this._axios.post(START_MINE)).data

      if (data.code && data.code === 1) {
        this.log('rush success, ganancia: ' + data.data.order_info.get_money)
        this.runTimer(HOUR * 4)
      }
      else
        this.logFile(JSON.stringify(data))
    }
    catch (err) { this.logFile(err.message || JSON.stringify(err)) }
  }

  get randomInt() { return randomInt(60, 80) }

  runTimer(time) {
    let total_time = time + (this.randomInt * 1000)
    this._timer = setTimeout(() => {
      this.checkLogin()
    }, total_time)
    this.logFile('Timer in: ' + parseTime(total_time))
  }

  createAxiosInstance(base_url) {
    this._axios = axios.create({
      baseURL: base_url
    })
    this._axios.interceptors.request.use( (config)=> {
      config.headers = { ...this._headers, ...config.headers }
      return config
    })
  }

  logFile(text) {
    this.log(text)
    let stamp = dayjs().format('YYYY-MM-DD HH:mm:ss')
    stamp = `${stamp} ${this.constructor.name} > ${this._session.user_log}: ${text}\r\n`
    fs.appendFile('./logging.log', stamp, this.void)
  }

  log(text) { console.log(`${this.constructor.name} > ${this._session.user_log}: ${text}`) }

  void() {}

}