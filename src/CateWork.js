import cookieResponse from 'set-cookie-parser'
import BasicBot from "./BasicBot.js";

const BASE_URL = 'https://catework.com/'

const HOUR = 60 * 60 * 1000

export default class CateWork extends BasicBot {

  constructor(credentials) {
    credentials.pass = Buffer.from(credentials.pass).toString('base64')
    credentials = new URLSearchParams(credentials)
    super(credentials)

    this._headers.origin = BASE_URL.substring(0, BASE_URL.length - 1)
    this._headers.referer = BASE_URL
    this.createAxiosInstance(BASE_URL)
  }

  async login() {
    const response = await this._axios({
      url: 'curl/validacion',
      method: 'post',
      data: this._credentials
    })
    this.startSession(response)
    this.purchase()
  }

  async purchase() {
    const response = await this._axios({
      url: 'a/php/efectuar_compra',
      method: 'post',
      data: {},
      headers: { cookie: this.buildCookieHeader() }
    })
    console.log(response.data)
    this.runTimer((HOUR * 2) + (1000 * 60))
  }

  checkLogin() { this.login() }

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
    this._session.cookies.push('pasar_intro=si')
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