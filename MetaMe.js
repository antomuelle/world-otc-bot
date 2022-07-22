import axios from "axios"
import Https from 'https'
import cookieResponse from 'set-cookie-parser'

const BASE_URL = 'https://www.meta-meta.me'
const LOGIN_URL = BASE_URL + '/tz/api/login'
const TASK_LIST = BASE_URL + '/tz/api/task/list'
const BEGIN_TASK = BASE_URL + '/tz/api/begin/task'
const RECEIVE_INCOME = BASE_URL + '/tz/api/receive/income'

const httpsAgent = new Https.Agent({rejectUnauthorized: false})

export default class MetaMe {

  constructor(credentials) {
    this.credentials = credentials
    this.session = {
      cookie: null,
      authorization: null,
      wait_time: null
    }
    this.headers = {
      Origin: 'https://www.meta-meta.me',
      Referer: 'https://www.meta-meta.me/',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Mobile Safari/537.36'
    }

    this._axios = axios.create({
      baseURL: BASE_URL,
      withCredentials: true,
      httpsAgent
    })
    this._axios.interceptors.request.use( (config)=> {
      config.headers = this.headers
      return config
    })
  }

  async login() {
    let response = await this._axios({
      url: LOGIN_URL,
      method: 'post',
      data: this.credentials
    })
    this.log('inicio de sessio exitoso')
    this.startSession(response)
    await this.getAssets()
    this.makeTask()
  }

  async getAssets() {
    let response = await this._axios({
      url: BASE_URL + '/tz/api/user/assets',
      method: 'post',
      data: { userId: this.session.userId }
    })
    this.session.balance = Number(response.data.data.accountBalance)
    this.log('account balance: ' + this.session.balance)
  }

  async makeTask() {
    let response = await this._axios({
      url: TASK_LIST,
      method: 'post',
      data: { taskAreaId: '6', userId: this.session.userId }
    })

    if (!response.data.success) {
      this.login()
      return
    }

    const task = response.data.data.tasks[0]
    this.session.wait_time = Number(task.completeMinute)
    if (task.status === 4) {
      // not started, begin task
      if (this.session.balance < task.needMinIntegral) {
        this.log('balance insufficient')
        this.initTimer(this.session.wait_time * 60 * 1000)
        return
      }
      this.log('not started, begining task')
      await this._axios({
        url: BEGIN_TASK,
        method: 'post',
        data: { userId: this.session.userId, taskId: '15', integral: String(task.needMinIntegral) }
      })
      this.log('task complete, starting timer')
      this.initTimer(this.session.wait_time * 60 * 1000)
    }
    else if (task.status === 2) {
      // receive reward
      this.log('receiving reward')
      await this._axios({
        url: RECEIVE_INCOME,
        method: 'post',
        data: { taskId: '15', userId: this.session.userId }
      })
      this.log('reward received, re-calling task')
      this.makeTask()
    }
    else if (task.status === 1) {
      this.log('task in progress, left: ' + (task.surplusTime/1000/60) + ' minutes')
      this.initTimer(Number(task.surplusTime))
    }
  }
  async test() {
    let response = await this._axios({
      url: TASK_LIST,
      method: 'post',
      data: { taskAreaId: '6', userId: this.session.userId }
    })
    console.log(response)
  }

  initTimer(time) {
    const total = time + randInt(1000 * 15, 1000 * 45)
    setTimeout(() => {
      this.makeTask()
    }, total );
    this.log('timer in: ' + (total / 1000 / 60) + ' minutes')
  }

  startSession(response) {
    if (response.data.has('data')) {
      this.session.userId = response.data.data.userId
      this.session.authorization = response.data.data['Authorization']
      this.headers['Authorization'] = `Bearer ${this.session.authorization}`
    }
    if (response.headers.has('set-cookie')) {
      const cookies = cookieResponse.parse(response.headers['set-cookie'], {map: true})
      if (cookies.has('SESSION')) {
        this.session.cookie = cookies['SESSION']['value']
        this.headers['Cookie'] = `SESSION=${this.session.cookie}; Authorization=Bearer ${this.session.authorization}; userId=${response.data.data.userId}`
      }
    }
  }

  log(text) { console.log(`MetaMe> ${this.credentials.userName}: ${text}`) }

}