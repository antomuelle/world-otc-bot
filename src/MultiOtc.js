import axios from "axios"
import dayjs from "dayjs"
import utc from 'dayjs/plugin/utc.js'
import timezone from 'dayjs/plugin/timezone.js'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'

const BASE_URL = 'https://otcserver.com/'
const LOGIN_URL = 'gateway/sso/user_login_check'
const DEAL_INFO = 'gateway/user/getDealInfo'
const DEAL_LOGS = 'gateway/user/getDealLogs?page=1&limit=10'
const CREATE_ORDER = 'gateway/user/createOrder'
const SUBMIT_ORDER = 'gateway/user/submitOrder'
// const GET_INFO = 'gateway/sso/getinfo'

const HOUR = 1000 * 60 * 60
const FORMAT = 'MM-DD HH:mm'
const TIME_ZONE = 'America/Caracas'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customParseFormat)

export default class MultiOtc {
  #axios
  #timer = null
  #should_stop = false
  #credentials = {}
  #session = {
    cookie: null,
    token: null,
    userinfo: null,
    wait_time: null
  }

  #headers = {
    platform: 'android',
    platfromtype: 'web',
    'sec-ch-ua': '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
    'sec-ch-ua-mobile': '?1',
    'sec-ch-ua-platform': '"Android"',
    'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Mobile Safari/537.36'
  }

  constructor(mobile, data, type = 'world') {
    // this.#credentials = credentials
    this.#credentials.mobile = mobile
    this.#credentials.password = data.password
    this.#credentials.type = 'mobile'
    data.instance = this
    this.#axios = axios.create({
      baseURL: type === 'world' ? BASE_URL : 'https://butcotc.cc/',
      withCredentials: true,
    })
    this.#axios.interceptors.request.use( (config)=> {
      config.headers = this.#headers
      return config
    })
  }

  async login() {
    delete this.#headers.token
    delete this.#headers.userid
    let response = await this.#axios({
      url: LOGIN_URL,
      method: 'post',
      data: this.#credentials
    })
    this.startSession(response)
    this.log('login correcto')
    this.checkLogin()
  }

  async start() {
    this.#should_stop = false
    if (this.#session.token)
      await this.checkLogin()
    else
      await this.login()
  }

  stop() {
    if (this.#timer) {
      clearTimeout(this.#timer)
      this.#timer = null
    }
  }

  stopNextTime() { this.#should_stop = true }

  get paused() { return !this.#timer }

  async runDeal() {
    const balance = this.#session.balance
    if (balance < this.#session.deal_min_balance) {
      this.log('balance insuficiente');
      this.decideFromLogs()
      return
    }
    this.log('balance: ' + balance)

    let data = (await this.#axios({
      url: CREATE_ORDER,
      method: 'post',
      data: { order_amount: balance }
    })).data
    const order_id = data.data.orderId
    this.log('order id: ' + order_id)

    data = (await this.#axios({
      url: SUBMIT_ORDER,
      method: 'post',
      data: { orderId: order_id }
    })).data
    this.log('order SN: ' + data.data.ordersn)

    this.log('tarea terminada')
    if (!this.#should_stop)
      this.runTimer(HOUR * 3)
  }

  async checkLogin() {
    const data = (await this.getDealInfo()).data
    if (data.code > 500 || data.msg === 'error') {
      this.log('No esta logueado, iniciando session...')
      this.login()
    }
    else {
      const total_balance = Number(data.userinfo.total_balance)
      if (total_balance < data.userinfo.deal_min_balance) {
        this.log('El usuario no tiene fondos suficientes')
        this.log('revision dentro de 1 hora')
        this.runTimer(HOUR)
        return
      }
      this.#session.balance = data.userinfo.balance_number
      this.#session.deal_min_balance = data.userinfo.deal_min_balance
      this.log('comprobacion de login correcta, yendo a runDeal')
      this.runDeal()
    }
  }

  runTimer(time) {
    const total_time = time + (randInt(60, 90) * 1000)
    this.#timer = setTimeout(() => {
      this.#timer = null
      this.checkLogin()
    }, total_time);
    this.log('timer in:' + (total_time / 1000 / 60) + ' minutos');
  }

  getDealInfo() {
    return this.#axios({
      url: DEAL_INFO,
      method: 'post',
    })
  }

  async decideFromLogs() {
    let data = (await this.#axios({
      url: DEAL_LOGS,
      method: 'get',
      params: { page: 1, limit: 10 }
    })).data

    if (data.data.length > 0) {
      const deal_log = data.data[0]
      const now = dayjs().tz('UTC')
      const after = dayjs.tz(deal_log.send_time, FORMAT, TIME_ZONE)
      const time = after.diff(now)
      this.log('iniciando timer desde los logs')
      this.runTimer(time)
    }
  }

  startSession(response) {
    if (response.data.has('token')) {
      this.#session.token = response.data.token
      this.#headers.token = response.data.token
    }
    if (response.data.has('userinfo')) {
      this.#session.userinfo = response.data.userinfo
      this.#headers.userid = response.data.userinfo.user_id
    }
    // response.data.ifHas('token', this.#session)
    // response.data.ifHas('userinfo', this.#session)
  }

  log(text) { console.log(`WorldOTC> ${this.#session.userinfo.username}: ${text}`) }

}
