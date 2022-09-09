import BasicBot from "./BasicBot.js";
import dayjs from "dayjs"
import utc from 'dayjs/plugin/utc.js'
import timezone from 'dayjs/plugin/timezone.js'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
import md5 from "blueimp-md5";

const BASE_URL = 'https://api.goldendeer.live/buyer/'
const HOUR = 1000 * 60 * 60
const FORMAT = 'MM-DD HH:mm'
const TIME_ZONE = 'America/Caracas'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customParseFormat)

export default class GoldenDeer extends BasicBot {

  constructor(credentials) {
    credentials = {
      ...credentials,
      password: md5('NjkmDMZ1M7iZEHjlHOd7T26XgkdiMI' + credentials.password),
      prefix: credentials.prefix || '+1',
      gCode: '',
      os: 'android'
    }
    super(new URLSearchParams(credentials))

    this._session.user_log = credentials.username

    this._headers = {
      ...this._headers,
      'sec-ch-ua': '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
      'sec-ch-ua-mobile': '?1',
      'sec-ch-ua-platform': '"Android"',
    }
    this.setBaseHeaders(BASE_URL)
    this.createAxiosInstance(BASE_URL)
  }

  async login() {
    delete this._headers.authorization
    try {
      const response = await this._axios({
        url: 'login',
        method: 'post',
        data: this._credentials
      })
      if (response.data.code === 200) {
        this.startSession(response)
        this.checkLogin()
        this.log(response.data.msg)
      }
      else this.logFile('error en login, msg: ' +  response.data.msg)
    }
    catch (error) {
      this.logFile('error >= 400 quizas la plataforma murio?')
      this.runTimer(HOUR)
    }
  }

  async checkLogin() {
    try {
      let { data } = await this._axios.get('user/getDealInfo')
      if (data.code > 500 || data.msg === 'error') {
        this.logFile('No esta logueado, iniciando session...')
        this.login()
      } else {
        const userinfo = data.data.userinfo
        const total_balance = Number(userinfo.total_balance)
        if (total_balance < userinfo.deal_min_balance) {
          this.logFile('El usuario no tiene fondos suficientes, revision dentro de 1 hora')
          this.runTimer(HOUR)
          return
        }
        this._session.balance = Number(userinfo.balance)
        this._session.deal_min_balance = userinfo.deal_min_balance
        this.log('comprobacion de login correcta, yendo a runDeal')
        this.runDeal()
      }
    } catch (error) {
      this.logFile(error)
    }
  }

  async runDeal() {
    const balance = this._session.balance
    if (balance < this._session.deal_min_balance) {
      this.logFile('balance insuficiente');
      this.decideFromLogs()
      return
    }
    this.log('balance: ' + balance)

    let data = (await this._axios({
      url: 'user/createOrder',
      method: 'post',
      data: { amount: balance }
    })).data
    const token_id = data.data.token_id
    this.log('token id: ' + token_id)

    data = (await this._axios({
      url: 'user/buyOrder',
      method: 'post',
      data: { amount: balance, token_id }
    })).data
    this.log('order id: ' + data.data.order_id)

    this.log('tarea terminada, profit: ' + data.data.profit)
    // if (!this.#should_stop)
      this.runTimer(HOUR * 3)
  }

  async decideFromLogs() {
    const { data } = await this._axios({
      url: 'user/getDealLogs',
      method: 'get',
      params: { page: 1, limit: 10 }
    })

    if (data.data.lists.length > 0) {
      const deal_log = data.data.lists[0]
      const now = dayjs().tz('UTC')
      const after = dayjs.tz(deal_log.end_time * 1000, FORMAT, TIME_ZONE)
      const time = after.diff(now)
      this.log('iniciando timer desde los logs')
      this.runTimer(time)
    }
  }
  
  get randomInt() { return randInt(60, 90) }

  startSession(response) {
    this._session.init = true
    if (response.data.code && response.data.code === 200) {
      this._session.token = response.data.data
      this._headers.authorization = 'Bearer ' + response.data.data
    }
  }

}