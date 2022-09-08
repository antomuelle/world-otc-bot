import cookieResponse from 'set-cookie-parser'
import BasicBot from "./BasicBot.js";

const BASE_URL = 'https://publiextra.com/'

const HOUR = 60 * 60 * 1000
const TIME_TEXT = 'Tiempo de espera: '

export default class PubliExtra extends BasicBot {

  constructor(key, data) {
    let credentials = {
      correo: key,
      pass: Buffer.from(data.pass).toString('base64')
    }
    credentials = new URLSearchParams(credentials)
    super(credentials)
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
      this.startSession(response)
      this.checkLogin()
    }
    catch (error) {
      console.log('no se puede iniciar session, quizas la plataforma murio?')
      this.runTimer(HOUR)
    }
  }

  async purchase() {
    const response = await this._axios({
      url: 'a/php/efectuar_compra',
      method: 'post',
      data: {},
      headers: { cookie: this.buildCookieHeader() }
    })
    console.log(response.data)
    this.runTimer(HOUR + (1000 * 60))
  }

  get randomInt() { return randInt(0, 30) }

  async checkLogin() {
    try {
      const response = await this._axios({
        url: 'a/tareas',
        method: 'get',
        headers: { cookie: this.buildCookieHeader() },
        maxRedirects: 0
      })
      let index = response.data.indexOf(TIME_TEXT, 4000)
      if (index === -1) {
        console.log('cadena no encontrada, comenzando trading')
        this.purchase()
      }
      else {
        index += TIME_TEXT.length
        const raw = response.data.substring(index, index + 7)
        const fractions = raw.split(' ')
        let time = 0
        let hours = parseInt(fractions[0].substring(0, 2))
        time += hours * 60 * 60 * 1000
        let minutes = parseInt(fractions[1].substring(0, 2))
        time += minutes * 60 * 1000
        console.log('time en miliseconds: ' + time)
        this.runTimer(time + (1000 * 60))
      }
    } catch (error) {
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