import axios from "axios"
import fs from 'fs'
import dayjs from "dayjs"
import isBetween from 'dayjs/plugin/isBetween.js'
import minMax from 'dayjs/plugin/minMax.js'
import utc from 'dayjs/plugin/utc.js'
import timezone from 'dayjs/plugin/timezone.js'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
import { headers } from "./headers.js";

dayjs.extend(isBetween)
dayjs.extend(minMax)
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customParseFormat)
const FORMAT = 'MM-DD HH:mm'
const TIME_ZONE = 'America/Manaus'

const BASE_URL = 'https://www.cotps.com'
const LOGIN_URL = BASE_URL + ':8443/api/mine/sso/user_login_check'
const DEAL_INFO = BASE_URL + ':8443/api/mine/user/getDealInfo'
const DEAL_LOGS = BASE_URL + ':8443/api/mine/user/getDealLogs'
const GET_INFO = BASE_URL + ':8443/api/mine/sso/getinfo'
const CREATE_ORDER = BASE_URL + ':8443/api/mine/user/createOrder'
const SUBMIT_ORDER = BASE_URL + ':8443/api/mine/user/submitOrder'

const session = {}
const runner = {
	total_balance: 0,
	freeze_balance: 0,
	balance: 0,
	sn_orders: [],
	rounds: 0
}

const credentials = {
	mobile: '',
	password: '',
	type: 'mobile'
}

function _log(text) {
	console.log(text)
	fs.appendFile('./log.txt', text+'\r\n', ()=> {})
}

export default class Cotp {

	constructor() {}

	start() {
		if (this.haveSession())
			this.checkLogin()
		else
			this.doLogin()
	}

	doLogin() {
		delete headers.LOGIN.authorization
		axios({
			url: LOGIN_URL,
			method: 'post',
			headers: headers.LOGIN,
			data: credentials
		}).then( response => {
			session.headers = response.headers
			this.setAuthorization()
			_log('inicio de session correcto')
			this.checkLogin()
		}).catch(error=> {
			_log('error iniciando session, function:doLogin, error: '+error)
		})
	}

	async checkLogin() {
		const data = (await this.getDealInfo()).data
		if (!data.success || data.isLogin === false) {
			_log('fallo en la comprobacion de login, function:checkLogin')
			this.doLogin()
		}
		else {
			const userinfo = data.userinfo
			runner.total_balance = userinfo.total_balance
			runner.balance = userinfo.balance
			runner.freeze_balance = Number(userinfo.freeze_balance)
			runner.deal_min = userinfo.deal_min_balance
			_log('comprobacion de login correcta, yendo a runDeals')
			console.log(runner)
			this.runDeals()
		}
	}

	async runDeals() {
		if (runner.balance < runner.deal_min) {
			_log('balance menor al minimo, saliendo... function:runDeals')
			this.decideFromLogs()
			return
		}

		while(runner.balance > runner.deal_min) {
			let response, body
			//create an order
			response = await this.createOrder()
			body = response.data
			runner.orderId = body.data.orderId
			
			//submitorder
			response = await this.submitOrder(runner.orderId)
			body = response.data
			runner.balance = body.balance
			runner.freeze_balance += body.data.price
			runner.sn_orders.push(body.data.ordersn)
			runner.rounds += 1

			console.log(runner)
			_log('round called...')
		}
		_log('Rounds terminated with: ' + runner.rounds + ' rounds')

		const logs = (await this.getDealLogs(1, runner.rounds)).data
		const max_time = this.decideMaxTime(logs.data) + (60000)
		_log('date en el sistema: ' + Date())
		_log(JSON.stringify(logs, null, 2))
		_log('estableciendo timer dentro de: ' + max_time + ' miliseconds (+1 minuto)')
		setTimeout(() => {
			this.checkLogin()
		}, max_time);
	}

	async decideFromLogs() {
		let logs = (await this.getDealLogs(1, 10)).data
		_log(`found ${logs.data.length} logs`)
		logs = this.getTimesInRange(logs.data)
		_log(`and filter ${logs.length} in the same range`)
		const times = []
		for (const deal of logs)
			times.push(dayjs(deal.send_time, FORMAT))
		
		const today = dayjs().tz(TIME_ZONE)
		const end = dayjs.max(times)
		const ms = today.diff(end)
		_log('starting timer in ' + ms + ' miliseconds')
		console.log(today.format(FORMAT))
		console.log(end.format(FORMAT))
		console.log(ms)
		//this.startTimer(ms)
	}
	
	startTimer(time, seconds = 60) {
		setTimeout(() => {
			this.checkLogin()
		}, time + (seconds * 1000));
	}

	getDealLogs(page = 1, size= 3) {
		return axios({
			url: DEAL_LOGS,
			method: 'get',
			headers: headers.LOGIN,
			params: {page, size}
		})
	}

	decideMaxTime(logs = []) {
		if (logs.length === 0) return 0
		const times = []
		for (const deal of logs) {
			const init = dayjs(deal.time, FORMAT)
			const final = dayjs(deal.send_time, FORMAT)
			times.push(final.diff(init))
		}
		return Math.max(...times)
	}

	getTimesInRange(logs) {
		if (logs.length <= 1) return logs
		// guardo el primer elemento en una constante
		const last = dayjs(logs[0].time, FORMAT)
		const minus15 = last.subtract(15, 'minutes')
		let segment = []
		for (const deal of logs) {
			//compruebo si cada tiempo esta entre 2 tiempos (inclusivos)
			if (dayjs(deal.time, FORMAT).isBetween(minus15, last, null, '[]'))
				segment.push(deal)
		}
		return segment
	}

	getDealInfo() {
		return axios({
			url: DEAL_INFO,
			method: 'get',
			headers: headers.LOGIN
		})
	}

	createOrder() {
		return axios({
			url: CREATE_ORDER,
			method: 'get',
			headers: headers.LOGIN
		})
	}

	submitOrder(orderId) {
		return axios({
			url: SUBMIT_ORDER,
			method: 'get',
			params: { orderId },
			headers: headers.LOGIN
		})
	}

	getInfo() {
		axios({
			url: GET_INFO,
			method: 'post',
			headers: {
				...headers.LOGIN,
				'Content-Type': 'application/json'
			}
		}).then(response=> {
			console.log('is logged: ' + response.data.success)
		})
	}

	haveSession() {
		let data = fs.readFileSync('./session.json', 'utf8')
		if (data.length < 10)
			return false
		session.headers = JSON.parse(data).headers
		this.setAuthorization()
		return true
	}

	writeSession() {
		fs.writeFileSync('./session.json', JSON.stringify(session))
	}

	setAuthorization() {
		headers.LOGIN.authorization = 'Bearer ' + session.headers.authorization
	}

}