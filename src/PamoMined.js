import cookieResponse from 'set-cookie-parser'
import BasicBot from "./BasicBot.js";

const BASE_URL = 'https://pamomined.com/'

const HOUR = 60 * 60 * 1000
const FIND_TEXT = "anadir_renta('"

export default class PubliExtra extends BasicBot {

  constructor(key, data) {
    let credentials = {
      correo: key,
      pass: Buffer.from(data.pass).toString('base64')
    }
    credentials = new URLSearchParams(credentials)
    super(credentials)
    this._session.user_log = key
    data.instance = this

    this._headers.origin = BASE_URL.substring(0, BASE_URL.length - 1)
    this._headers.referer = BASE_URL
    this.createAxiosInstance(BASE_URL)
  }

  async login() {
    try {
      const response = await this._axios({
        url: 'curl/validacion',
        method: 'post',
        data: this._credentials
      })
      if (response.data.proceso === 'error')
        this.logFile('error en login, texto: ' + response.data.texto)
      else {
        this.startSession(response)
        this.checkLogin()
      }
    }
    catch (error) {
      this.logFile('no se puede iniciar session, quizas la plataforma murio?')
      this.runTimer(HOUR)
    }
  }

  async getProfit(id, code) {
    const { data } = await this._axios({
      url: 'a/php/tomar_renta.php',
      method: 'post',
      data: new URLSearchParams({id, conse: code}),
      headers: { cookie: this.buildCookieHeader() }
    })
    this.runTimer(HOUR * 5)
  }

  get randomInt() { return randInt(60, 90) }

  async checkLogin() {
    try {
      const response = await this._axios({
        url: 'a/base',
        method: 'get',
        headers: { cookie: this.buildCookieHeader() },
        maxRedirects: 0
      })
      const html = response.data
      const index = html.indexOf(FIND_TEXT, 3000)
      const portion = html.substring(index-100, index+100)

      let start = portion.indexOf(FIND_TEXT) + FIND_TEXT.length
      const id = portion.substring(start, portion.indexOf("'", start))
      start = portion.indexOf("'", start + id.length + 1) + 1
      const code = portion.substring(start, portion.indexOf("'", start))
      this.getProfit(id, code)
    }
    catch (error) {
      console.log('No esta logueado, iniciando session...')
      this.login()
    }
  }

  startSession(response) {
    this._session.init = true
    this._session.cookies = []
    if (response.headers.has('set-cookie')) {
      const cookies = cookieResponse.parse(response.headers['set-cookie'], { map: true })
      if (cookies.has('PHPSESSID'))
        this._session.cookies.push('PHPSESSID=' + cookies['PHPSESSID']['value'])
    }
    this._session.cookies.push('User_x148=' + response.data.user)
    this._session.cookies.push('Pass_x148=' + response.data.pass)
    this._session.cookies.push('Img_x148=' + response.data.img)
  }

  buildCookieHeader() {
    let result = ''
    if (this._session.cookies.length > 0) {
      for (let i = 0; i < this._session.cookies.length; i++) {
        const cookie = this._session.cookies[i];
        result += cookie + '; '
      }
      result = result.substring(0, result.length - 2)
    }
    return result
  }

}