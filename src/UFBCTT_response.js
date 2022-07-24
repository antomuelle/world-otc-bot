// post https://api.ufbctt.life/api/user/login
// { "account": "927448868", "password": "s0nsam0sha" }
const login = {
  "code": 1,
  "msg": "Logged in successful",
  "time": "1658620928",
  "data": {
      "userinfo": {
          "id": 218132,
          "nickname": "927448868",
          "walletaddress": "TNQ33Mnp4fBud34hHF1k3PgXAMbr5AECoy",
          "invite_code": null,
          "mobile": "927448868",
          "avatar": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgaGVpZ2h0PSIxMDAiIHdpZHRoPSIxMDAiPjxyZWN0IGZpbGw9InJnYigxOTYsMjI5LDE2MCkiIHg9IjAiIHk9IjAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48L3JlY3Q+PHRleHQgeD0iNTAiIHk9IjUwIiBmb250LXNpemU9IjUwIiB0ZXh0LWNvcHk9ImZhc3QiIGZpbGw9IiNmZmZmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIHRleHQtcmlnaHRzPSJhZG1pbiIgZG9taW5hbnQtYmFzZWxpbmU9ImNlbnRyYWwiPjk8L3RleHQ+PC9zdmc+",
          "level": 1,
          "token": "f49638ce-6774-4b82-8f1d-45418883f44e",
          "user_id": 218132,
          "createtime": 1658620928,
          "expiretime": 1661212928,
          "expires_in": 2592000
      }
  }
}

// post https://api.ufbctt.life/api/user/getBalance
const getBalance = {
  "code": 1,
  "msg": "",
  "time": "1658620931",
  "data": {
      "amount": "6.062000",
      "finance_amount": "0.000000",
      "experience_amount": "0.00",
      "experiencetime": false,
      "experiencetimes": 0,
      "test": 0,
      "miner_amount": 0,
      "notice": [
          "5842 * * * * 556 16 USDT extraction",
          "0412 * * * * 331 16 USDT extraction",
          "0414 * * * * 880 17 USDT extraction",
          "0469****458 Team Award 500USDT",
          "0970 * * * * 547 11 USDT top-up",
          "0125 * * * * 115 1000 USDT top-up",
          "5193 * * * * 869 5000 USDT top-up",
          "0785 * * * * 681 extract 3680 USDT",
          "8138****4534 Team Award 1300USDT",
          "2548 * * * * 4686 top-up 10 USDT",
          "6864 * * * * 4744 extract 697 USDT",
          "4420 * * * * 5546 20000 USDT top-up",
          "4572 * * * * 465 147 USDT top-up",
          "1254 * * * * 654 287 USDT top-up",
          "5730 * * * * 831 top-up USDT 86.2",
          "0414 * * * * 952 top-up USDT 19.2",
          "380 * * * * 746 extract 4953 USDT",
          "58****1840 Team award 300USDT",
          "379****1003 Team award 500USDT",
          "84 * * * * 5440 762 USDT top-up",
          "688 * * * * 150 1000 USDT top-up",
          "509 * * * * 0479 100 USDT top-up",
          "256 * * * * 791 extract 380 USDT",
          "1473 * * * * 2334 top-up USDT 50",
          "81 * * * * 4176 9000 USDT top-up",
          "81 * * * * 9944 extract 13200 USDT",
          "66 * * * * 5016 extract 4568 USDT",
          "53 * * * * 4071 600 USDT top-up",
          "56****6054 Team award 105.7USDT",
          "375****0131 Team award 186.2USDT",
          "370****0172 Team award 980.7USDT",
          "880****4504 Team award 7510USDT",
          "222 * * * * 0168 100 USDT top-up",
          "960 * * * * 1752 extract 1735 USDT",
          "352 * * * * 4760 50000 USDT top-up",
          "505 * * * * 4145 top-up USDT 9999.99",
          "81 * * * * 6014 5000 USDT top-up",
          "81 * * * * 3331 30000 USDT top-up",
          "316****4888 premios de equipo 5USDT",
          "086****4228 premio del equipo 50USDT",
          "068****00521 extracción 639USDT",
          "58041***431 extracción 5860USDT",
          "58041**632 recarga 999USDT",
          "0125***4345 recompensa del equipo 780USDT",
          "5115***10345 premio del equipo 3000USDT",
          "9804**4423 recompensa del equipo 10000USDT"
      ],
      "daywk": 0.0155,
      "dayxj": 0
  }
}

// post https://api.ufbctt.life/api/level/obtainLevelList
const obtainLevelList = {
  "code": 1,
  "msg": "",
  "time": "1658620932",
  "data": [
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
}

// post https://api.ufbctt.life/api/meal/startMing
// { "id": 1 }
const startMing = {
  "code": 1,
  "msg": "",
  "time": "1658622131",
  "data": null
}

// post https://api.ufbctt.life/api/meal/today
const today = {
  "code": 1,
  "msg": "",
  "time": "1658623478",
  "data": {
      "level": 1,
      "releasetime": 1658622131,
      "status": "0",
      "createtime_text": "",
      "currenttime": 1658623478
  }
}