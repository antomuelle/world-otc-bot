import BasicBot from './BasicBot.js'
import dayjs from "dayjs"

const BASE_URL = 'https://api.uftp.vip/api/'
const LOGIN_URL = 'user/login'
const START_MINE = 'shop/pair'
const RUSH_INFO = 'shop/getShopList'
const PREVIEW_MINE = 'shop/showShop'

const TOKEN = 'e72c8917-5f33-4d65-9e13-f7b433bc77ef'
const HOUR = 60 * 60 * 1000

export default class UFTP extends BasicBot {

  constructor() {
    super({})
    this._session.user_log = '927448868'
    
    this._headers = {
      ...this._headers,
      referer: 'https://www.uftp.vip/',
      origin: 'https://www.uftp.vip',
      token: TOKEN,
      'sec-ch-ua-platform': 'Android',
      'sec-ch-ua-mobile': '?1',
      'sec-ch-ua': '"Chromium";v="106", "Google Chrome";v="106", "Not;A=Brand";v="99"'
    }
    this.createAxiosInstance(BASE_URL)
  }

  async checkLogin() {
    try {
      const { data } = await this._axios({
        url: RUSH_INFO,
        method: 'post',
      })
      if (data.code && data.code === 1) {
        const balance = data.data.extend
        if (Number(balance.money) >= 5) {
          this.startMiner()
        } else if (Number(balance.order_lock_money) > 0) {
          this.logFile('money lock')
          let last_rush = data.data.list
          if (Array.isArray(last_rush) && last_rush.length > 0) {
            last_rush = last_rush[0]
            const now = dayjs(Number(data.time + '000'))
            const end = dayjs(Number(last_rush.end_time + '000'))
            const diff = end.diff(now)
            if (diff > 0) {
              this.runTimer(diff)
              this.logFile('seteando diferencia de tiempo')
            }
            else
              this.logFile('diferencia negativa')
          }
          else { this.logFile('last_rush no es arrary o esta vacio: ' + JSON.stringify(data.data.list))}
        }
        else {
          this.logFile('balance insuficiente, intentare en 2 horas')
          this.runTimer(HOUR * 2)
        }
      }
      else { this.logFile(JSON.stringify(data)) }
    }
    catch (err) {
      this.logFile(err.message || err)
    }
  }

  async startMiner() {
    try {
      let { data } = await this._axios({
        url: PREVIEW_MINE,
        method: 'post'
      })
      if (data.code && data.code <= 0)
        throw new Error(data.msg || 'error en PREVIEW_MINE')
      else
        this.logFile('preview ok, data: '+data)

      data = (await this._axios({
        url: START_MINE,
        method: 'post'
      })).data

      if (data.code && data.code === 1) {
        this.log('rush success, ganancia: ' + data.data.order_info.get_money)
        this.runTimer(HOUR * 4)
      }
      else
        this.logFile(JSON.stringify(data))
    }
    catch (err) { this.logFile(err.message || JSON.stringify(err)) }
  }

  get randomInt() { return randInt(15, 40) }

}

const login_response = {
  "code": 1,
  "msg": "login successfully",
  "time": "1666026156",
  "data": {
      "userinfo": {
          "id": 707043,
          "username": "antomuelle",
          "nickname": "antomuelle",
          "mobile": "927448868",
          "avatar": "/logo.png",
          "score": 100,
          "invitation_code": "lpsAInm",
          "token": "1942ec92-917c-4719-ae04-f06c0e1f5a5a",
          "user_id": "707043",
          "expiretime": 1670618156,
          "expires_in": 4592000
      }
  }
}

const rush_info_pre = {
  "code": 1,
  "msg": "",
  "time": "1666026192",
  "data": {
      "list": [],
      "extend": {
          "day_pair_num": "10000",
          "sum": "0.0000",
          "day_count": 0,
          "day_commission": "0.0000",
          "day_team_award": "0.0000",
          "team_sum": "0.0000",
          "order_lock_money": "0.0000",
          "money": "14.9950"
      }
  }
}
const rush_info_after = {
  "code": 1,
  "msg": "",
  "time": "1666026551",
  "data": {
      "list": [
          {
              "money": "14.9950",
              "get_money": "0.075000",
              "id": 172172,
              "create_time": 1666026551,
              "end_time": 1666040951,
              "create_time_text": "17/10/2022 18:09:11",
              "end_time_text": "17/10/2022 22:09:11"
          }
      ],
      "extend": {
          "day_pair_num": "10000",
          "sum": "0.0000",
          "day_count": 1,
          "day_commission": "0.0000",
          "day_team_award": "0.0000",
          "team_sum": "0.0000",
          "order_lock_money": "14.9950",
          "money": "0.0000"
      }
  }
}

const preview_mine = {
  "code": 1,
  "msg": "Operation success",
  "time": "1666026516",
  "data": {
      "order_info": {
          "money": "14.9950",
          "get_money": "0.0750",
          "order_num": "nqVduEPr1666026517"
      },
      "price": "14.9950",
      "slep": 1
  }
}

const run_miner = {
  "code": 1,
  "msg": "Operation success",
  "time": "1666026551",
  "data": {
      "order_info": {
          "user_id": 707043,
          "shop_id": 0,
          "order_num": "nqVduEPr1666026517",
          "money": "14.9950",
          "fee": "0.0000",
          "get_money": "0.0750",
          "super_order": 0,
          "rate": "0.50",
          "end_time": 1666040951
      }
  }
}