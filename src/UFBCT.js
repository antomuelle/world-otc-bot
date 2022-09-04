import axios from "axios"

const BASE_URL = 'https://api.ufbctt.life/api/'
const LOGIN_URL = 'user/login'
const GET_BALANCE = 'user/getBalance'
const START_MING = 'meal/startMing'
const MEAL_TODAY = 'meal/today'

const HOUR = 60 * 60

const LEVEL_LIST = [
  {
    "id": 1,
    "level": 1,
    "fax": "0.31",
    "principal": "5.00",
    "switch": 1,
    "ye_amount": "0.0155"
  },
  {
    "id": 2,
    "level": 1,
    "fax": "0.32",
    "principal": "10.00",
    "switch": 1,
    "ye_amount": "0.0320"
  },
  {
    "id": 3,
    "level": 1,
    "fax": "0.33",
    "principal": "30.00",
    "switch": 1,
    "ye_amount": "0.0990"
  },
  {
    "id": 4,
    "level": 1,
    "fax": "0.34",
    "principal": "50.00",
    "switch": 1,
    "ye_amount": "0.1700"
  },
  {
    "id": 5,
    "level": 2,
    "fax": "0.35",
    "principal": "100.00",
    "switch": 1,
    "ye_amount": "0.3500"
  },
  {
    "id": 6,
    "level": 2,
    "fax": "0.36",
    "principal": "300.00",
    "switch": 1,
    "ye_amount": "1.0800"
  },
  {
    "id": 7,
    "level": 2,
    "fax": "0.37",
    "principal": "500.00",
    "switch": 1,
    "ye_amount": "1.8500"
  },
  {
    "id": 8,
    "level": 3,
    "fax": "0.38",
    "principal": "1000.00",
    "switch": 1,
    "ye_amount": "3.8000"
  },
  {
    "id": 9,
    "level": 3,
    "fax": "0.39",
    "principal": "3000.00",
    "switch": 1,
    "ye_amount": "11.7000"
  },
  {
    "id": 10,
    "level": 3,
    "fax": "0.40",
    "principal": "5000.00",
    "switch": 1,
    "ye_amount": "20.0000"
  },
  {
    "id": 11,
    "level": 3,
    "fax": "0.45",
    "principal": "10000.00",
    "switch": 1,
    "ye_amount": "45.0000"
  },
  {
    "id": 12,
    "level": 3,
    "fax": "0.50",
    "principal": "30000.00",
    "switch": 1,
    "ye_amount": "150.0000"
  },
  {
    "id": 13,
    "level": 3,
    "fax": "0.54",
    "principal": "50000.00",
    "switch": 1,
    "ye_amount": "270.0000"
  },
  {
    "id": 14,
    "level": 3,
    "fax": "0.58",
    "principal": "100000.00",
    "switch": 1,
    "ye_amount": "580.0000"
  },
  {
    "id": 15,
    "level": 3,
    "fax": "0.60",
    "principal": "150000.00",
    "switch": 0,
    "ye_amount": "900.0000"
  }
]

export default class UFBCT {
  #_axios
  #timer = null
  #credentials
  #session = { userinfo: null }
  #headers = {
    origin: 'https://mobile.ufbctt.life',
    referer: 'https://mobile.ufbctt.life/',
    platform: 'H5',
    'sec-ch-ua-mobile': '?1',
    'sec-ch-ua-platform': '"Android"',
    'sec-ch-ua': '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
    'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Mobile Safari/537.36'
  }
  
  constructor(key, data, base_url = BASE_URL) {
    this.#credentials = { account: key, password: data.password }
    data.instance = this
    
    this.#_axios = axios.create({
      baseURL: base_url,
      withCredentials: true,
    })
    this.#_axios.interceptors.request.use( (config)=> {
      config.headers = { ...this.#headers, ...config.headers }
      return config
    })
  }

  async start() {
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

  get paused() { return !this.#timer }

  async login() {
    try {
      delete this.#headers.token
      const response = await this.#_axios({
        url: LOGIN_URL,
        method: 'post',
        data: this.#credentials
      })

      this.startSession(response)
      this.checkLogin()
    } catch (error) {
      console.log('no se puede iniciar session, quizas la plataforma murio?')
      this.runTimer(HOUR)
    }
    
  }

  async checkLogin() {
    const data = await this.getBalance()
    if (data) {
      this.#session.balance = data
      await this.startMing()
    } else {
      console.log('No esta logueado, iniciando session...')
      this.login()
    }
  }

  async getBalance() {
    try {
      const { data } = await this.#_axios({
        url: GET_BALANCE,
        method: 'post'
      })
      return (data.code && data.code === 1) ? data.data : null
    }
    catch (_) { return null }
  }

  async getTime() {
    const { data } = await this.#_axios({
      url: MEAL_TODAY,
      method: 'post'
    })
    if (!data.data) return 0
    return data.data.currenttime - data.data.releasetime
  }

  async startMing() {
    const passed_time = await this.getTime()
    const amount = Number(this.#session.balance.amount)
    if (passed_time === 0) {
      const response = await this.#_axios({
        url: START_MING,
        method: 'post',
        data: { id: this.getLevel(amount).id }
      })
      console.log('Ming:', response.data)
      this.runTimer(HOUR * 2)
    }
    else {
      this.runTimer((HOUR * 2) - passed_time)
    }
  }

  runTimer(time) {
    const total_time = (time + randInt(30, 60)) * 1000
    this.#timer = setTimeout(() => {
      this.#timer = null
      this.checkLogin()
    }, total_time)
    console.log('timer in:' + (total_time / 1000 / 60) + ' minutos')
  }

  getLevel(amount) {
    let index = 0
    for (; index < LEVEL_LIST.length; index++) {
      const element = LEVEL_LIST[index]
      const price = Number(element.principal)
      if (amount < price)
        return (index-1) < 0 ? null : LEVEL_LIST[index-1]
    }
    return LEVEL_LIST[index - 1]
  }

  startSession(response) {
    if (response.data.data && response.data.data.has('userinfo')) {
      this.#session.userinfo = response.data.data.userinfo
      this.#session.token = response.data.data.userinfo.token
      this.#headers.token = this.#session.token
    }
  }

}
