import proxy from 'http-proxy'

proxy.createProxyServer({ target: 'https://faucetpay.io', secure: true }).listen(8090)

export { proxy as default }