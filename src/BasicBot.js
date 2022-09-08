import axios from "axios"

export default class BasicBot {
  /** @type {import("axios").AxiosInstance} */
  _axios
  _headers = { 'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Mobile Safari/537.36' }
  _session = { init: false }
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
    const total_time = time + (this.randomInt * 1000)
    this._timer = setTimeout(() => {
      this.checkLogin()
    }, total_time)
    console.log('timer in:' + (total_time / 1000 / 60) + ' minutos')
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

}