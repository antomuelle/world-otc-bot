import BasicBot from "./BasicBot.js";

const BASE_URL = 'https://api.fnactax.com.cn/'

export default class Fnac extends BasicBot {

  constructor() {
    super()
    this.createAxiosInstance(BASE_URL)
    console.log(this._axios);
  }
}