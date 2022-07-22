import axios from "axios"
import cookieResponse from 'set-cookie-parser'

const BASE_URL = 'https://jetarice.com'
const LOGIN_URL = BASE_URL + '/php/validacion'
const TASK_URL = BASE_URL + '/s/php/solicitar'
const TASK_PAGE = BASE_URL + '/s/mis_tareas'

const HOUR = 1000 * 60 * 60
const TIME_TEXT = 'Termina en: '

export default class Jetarice {
  #_axios
  #credentials
  #session = { cookies: [], user_log: '' }
  #headers = {
    origin: 'https://jetarice.com',
    referer: 'https://jetarice.com/',
    'sec-ch-ua-mobile': '?1',
    'sec-ch-ua-platform': '"Android"',
    'sec-ch-ua': '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
    'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Mobile Safari/537.36'
  }

  constructor(credentials) {
    credentials.psw_input = Buffer.from(credentials.psw_input).toString('base64')
    this.#credentials = credentials

    this.#session.user_log = credentials.celular.substring(0, 10)

    this.#_axios = axios.create({ baseURL: BASE_URL })
    this.#_axios.interceptors.request.use( (config)=> {
      config.headers = { ...this.#headers, ...config.headers }
      return config
    })
  }

  async login() {
    let response = await this.request({
      url: LOGIN_URL + '/noexiste',
      method: 'post',
      data: new URLSearchParams(this.#credentials),
    })
    if (response.response) {
      response = response.response
    } else {
      console.log(response)
      return;
    }
    response.data = {}
    response.data.user = this.#credentials.celular
    response.data.pass = this.#credentials.psw_input
    this.startSession(response)
    response = await this.requestTask()
    console.log(response)

    /* const response = await this.#_axios({
      url: LOGIN_URL,
      method: 'post',
      data: new URLSearchParams(this.#credentials),
    })
    this.startSession(response)
    this.runTasks() */
  }

  async findTime() {
    try {
      const response = await this.#_axios({
        url: TASK_PAGE,
        method: 'get',
        maxRedirects: 0,
        headers: { cookie: `Pasar=si; ${this.#session['PHPSESSID']}; ${this.#session.cookies[0]}; ${this.#session.cookies[1]}` }
      })
      const text = response.data
      let index = text.indexOf(TIME_TEXT, 5000)
      if (index === -1) {
        this.log('cadena no encontrada, volviendo a intentar en media hora...')
        this.runTimer(HOUR / 2)
      }
      else {
        index += TIME_TEXT.length
        const raw = text.substring(index, index + 7)
        const fractions = raw.split(' ')
        let time = 0
        let hours = parseInt(fractions[0].substring(0, 2))
        time += hours * 60 * 60 * 1000
        let minutes = parseInt(fractions[1].substring(0, 2))
        time += minutes * 60 * 1000
        this.log('time en miliseconds: ' + time)
        this.runTimer(time)
      }
    } catch (error) {
      this.log('error en GET TASK_PAGE, volviendo a intentar en media hora...')
      this.runTimer(HOUR / 2)
    }
  }

  async runTasks() {
    let response
    do {
      response = await this.requestTask()
      if (response.data.proceso === 'insuficiente') {
        this.log('tarea no concluida por falta de saldo')
        this.findTime()
      }
      else
        this.log('tarea completada, llamando a la siguiente...')
    } while (response.data.proceso !== 'insuficiente');
  }

  async requestTaskPage() {
    try {
      return await this.#_axios({
        url: TASK_PAGE,
        method: 'get',
        maxRedirects: 0,
        headers: { cookie: `Pasar=si; ${this.#session['PHPSESSID']}; ${this.#session.cookies[0]}; ${this.#session.cookies[1]}` }
      })
    } catch(error) { return error }
  }

  async requestTask() {
    try {
      return await this.#_axios({
        url: TASK_URL,
        method: 'post',
        headers: { cookie: `Pasar=si; ${this.#session['PHPSESSID']}; ${this.#session.cookies[0]}; ${this.#session.cookies[1]}` }
      })
    } catch (error) { return error }
  }

  async checkLogin() {
    const response = await this.requestTaskPage()
    if (response.status && response.status >= 200 && response.status < 300) {
      this.log('Login valido, iniciando tareas')
      this.runTasks()
    }
    else {
      this.log('Login invalido, iniciando session...')
      this.login()
    }
  }

  runTimer(time) {
    const total_time = time + (randInt(60, 90) * 1000)
    setTimeout(() => {
      this.checkLogin()
    }, total_time);
    this.log('timer in:' + (total_time / 1000 / 60) + ' minutos');
  }

  startSession(response) {
    this.#session.cookies = []
    this.#session.cookies.push('User_x148=' + response.data.user)
    this.#session.cookies.push('Pass_x148=' + response.data.pass)

    if (response.headers.has('set-cookie')) {
      const cookies = cookieResponse.parse(response.headers['set-cookie'], { map: true })
      if (cookies.has('PHPSESSID')) {
        this.#session['PHPSESSID'] = 'PHPSESSID=' + cookies['PHPSESSID']['value']
      }
    }
  }

  log(text) { console.log(`Jetarice> ${this.#session.user_log}: ${text}`) }

  async test() {
    const ax = axios.create(undefined)
    const data = await ax.get('https://jetarice.com/login')
    console.log(data.data)
  }

  async request(config, intent = 1) {
    if (intent < 1) intent = 1
    while (intent > 0) {
      console.log('whiling request...')
      try {
        return { response: await this.#_axios(config) }
      } catch (error) {
        intent--
        if (intent <= 0)
          return { error }
      }
    }
  }

}

class AsyncRequest {
  #_axios

  constructor(config = null) {
    this.#_axios = axios.create(config || undefined)
  }

  async request(config, intent = 1) {
    if (intent < 1) intent = 1
    while (intent > 0) {
      try {
        return { response: await this.#_axios(config) }
      } catch (error) {
        intent--
        if (intent <= 0)
          return { error }
      }
    }
  }

  get instance() { return this.#_axios }
}