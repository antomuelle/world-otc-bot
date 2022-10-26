/** @typedef { import('express').Request } Request */
/** @typedef { import('express').Response } Response */

import { login, logout, register } from '../controllers/AuthController.js'
import * as AccountController from '../controllers/AccountController.js'
import { Router } from "express"
import passport from "passport"
import { jsonError } from '../utils.js'

const router = Router()

// Auth routes
router.post('/login', guestMiddleware, passport.authenticate('local'), login)
router.post('/register', guestMiddleware, register)
router.get('/logout', authMiddleware, logout)

// Safe group routes
const proteced = Router()
proteced.use(authMiddleware)

proteced.get('/platform/:code', AccountController.platforms)
proteced.get('/user/platforms', AccountController.userPlatforms)
proteced.get('/user/account/:code', AccountController.accountDetail)
proteced.get('/user/accounts/:code', AccountController.userAccounts)
proteced.post('/user/account/token', AccountController.updateToken)
proteced.post('/user/account/new', AccountController.newAccount)
proteced.post('/user/bot', AccountController.controlBot)

router.use('/', proteced)
export default router


// Middlewares
/** @param {Request} req */
function guestMiddleware(req, res, next) {
  if (req.isAuthenticated())
    jsonError(res, { message: 'user already authenticated' }, 301)
  else
    next()
}

/** @param {Request} req */
function authMiddleware(req, res, next) {
  if (req.isUnauthenticated())
    jsonError(res, 'you need to log in to see this part')
  else
    next()
}