import express from 'express'
import session from 'express-session'
import crypto from 'crypto'
import fs from 'fs'
import https from 'https'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const PORT = process.env.PORT || 5000
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express()
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true
}))
app.set('views', __dirname + '/views')
console.log(__dirname)
app.set('view engine', 'pug')
// app.listen(PORT, ()=> { console.log('Server running on: http://localhost:' + PORT) })
https.createServer({
  // key: fs.readFileSync(__dirname + '/ssl/key.pem'),
  // cert: fs.readFileSync(__dirname + '/ssl/cert.pem'),
  key: fs.readFileSync('/etc/letsencrypt/live/otcworld.ml/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/otcworld.ml/fullchain.pem')
}, app).listen(443, ()=> { console.log('Server running on: http://localhost:' + 443) })

app.get('/', (req, res)=> {
  if (req.session.user)
    res.redirect('/account')
  else
    res.redirect('/login')
})
app.get('/login', (req, res)=> {
  if (req.session.user) {
    res.redirect('/account')
    return
  }
  res.sendFile(__dirname + '/public/login.html')
})
app.post('/login', (req, res)=> {
  if (!req.body) { res.sendStatus(404); res.end('No body'); return }
  if (!req.body.mobile || !req.body.password) { res.sendStatus(401); res.end('No all parameters'); return }
  const { mobile, password } = req.body
  const data = STORE[mobile]
  if (!data) { res.sendStatus(401); res.end(); return }
  if (data.password !== password) { res.sendStatus(401); res.end(); return }

  req.session.user = mobile
  res.redirect('/account')
})
app.get('/account', isAuthenticated, (req, res)=> {
  const otc = getInstance(req)
  /**html*/
  const HTML = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head><body>
  <div style="text-align:center;max-width:400px;margin:auto">
    <h2>Hola ${req.session.user}!</h2>
    <h3>Bot ${ otc.paused ? 'Pausado' : 'Running'}</h3>
    ${otc.paused ? '<p><a href="/start">Iniciar Bot</a></p>'
    : '<p><a href="/stop">Pausar Bot</a></p><p><a href="/stop-next-time">Pausar Bot en la siguiente ronda</a></p>'}
    <a href="/logout">Logout</a>
  </div>
  </body>
  </html>
  `
  res.send(HTML)
})
app.get('/test', isAuthenticated, (req, res)=> {
  if (req.query.ufb !== undefined && req.session.user === '+51957072446') {
    STORE.ufb.stop()
  }
  res.send('ufb status: ' + STORE.ufb.paused)
})
app.get('/stop', isAuthenticated, (req, res)=> {
  if (req.query.ufb !== undefined && req.session.user === '+51957072446') {
    STORE.ufb.stop()
    console.log('ufb stopped')
  }
  getInstance(req).stop()
  res.redirect('/account')
})
app.get('/start', isAuthenticated, async (req, res)=> {
  if (req.query.ufb !== undefined && req.session.user === '+51957072446') {
    STORE.ufb.start()
    console.log('ufb started')
  }
  await getInstance(req).start()
  res.redirect('/account')
})
app.get('/stop-next-time', isAuthenticated, (req, res)=> {
  getInstance(req).stopNextTime()
  res.redirect('/account')
})
app.get('/logout', (req, res)=> {
  req.session.user = null
  req.session.destroy(()=> {
    res.redirect('/login')
  })
})

function generateToken() { return crypto.randomBytes(30).toString('hex') }
function isAuthenticated(req, res, next) {
  if (req.session.user) next()
  else res.redirect('/login')
}
function getInstance(request) { return STORE[request.session.user].instance }