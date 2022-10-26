/** @typedef { import('express').Request } Request */
/** @typedef { import('express').Response } Response */

import { QueryTypes } from 'sequelize';
import { make } from 'simple-body-validator';
import UFTP from '../bots/UFTP.js';
import { sequelize } from '../database/relations.js';
import { jsonError, jsonOk } from '../utils.js';

const { Account, Platform, User } = sequelize.models

export async function platforms(req, res) {
  let code = req.params.code
  try {
    if (code === 'all') {
      jsonOk(res, await Platform.findAll({
        attributes: { exclude: ['root_user', 'root_pass', 'details'] },
        where: { active: 1 }
      }))
    }
    else {
      code = parseInt(code)
      if (isNaN(code))
        return jsonError(res, 'bad request')
      jsonOk(res, await Platform.findByPk(code))
    }
  } catch (error) { jsonError(res, error.message ) }
}

/** @param {Request} req */
export async function userPlatforms(req, res) {
  try {
    const result = await sequelize.query(`
      SELECT DISTINCT name, platforms.id, platforms.active FROM platforms
      JOIN accounts ON platforms.id = accounts.platform_id
      WHERE accounts.user_id = :id`, {
        replacements: { id: req.user.id },
        type: QueryTypes.SELECT
      })
    jsonOk(res, result)
  }
  catch (error) { jsonError(res, error.message) }
}

/** @param {Request} req */
export async function userAccounts(req, res) {
  let code = req.params.code

  try {
    if (code === 'all') {
      /* const accounts = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password'] },
        include: { model: Account, attributes: { exclude: ['user_id'] } }
      }) */
      const accounts = await Account.findAll({ where: { user_id: req.user.id } })
      jsonOk(res, accounts)
    }
    else {
      code = parseInt(code)
      if (isNaN(code))
        return jsonError(res, 'bad request')
      const accounts = await Account.findAll({ where: { user_id: req.user.id, platform_id: code } })
      jsonOk(res, accounts)
    }
  }
  catch (error) { jsonError(res, error.message ) }
}

export async function accountDetail(req, res) {
  const code = parseInt(req.params.code)
  if (isNaN(code))
    return jsonError(res, 'bad request')
  try {
    const account = await Account.findByPk(code)
    if (account.user_id !== req.user.id)
      return jsonError(res, 'unauthorized')
    jsonOk(res, account)
  }
  catch (error) { jsonError(res, error.message) }
}

export async function updateToken(req, res) {
  const validator = make(req.body, {
    id: 'required|integer',
    token: 'required|string'
  })
  if (!validator.validate())
    return jsonError(res, { errors: validator.errors().all() })

  try {
    const account = await Account.findByPk(req.body.id)
    if (!account)
      return jsonError(res, 'the account does not exists')
    if (account.user_id !== req.user.id)
      return jsonError(res, 'unauthorized')
    
    await account.update({ session: { ...account.session, token: req.body.token } })
    jsonOk(res, 'token updated')
  }
  catch (error) { jsonError(res, error.message) }
}

export async function newAccount(req, res) {
  const validator = make(req.body, {
    platform_id: 'required|integer',
    username: 'required|string',
    password: 'required|string',
  })
  if (!validator.validate())
    return jsonError(res, { errors: validator.errors().all() })
  
  try {
    const platform = await Platform.findByPk(req.body.platform_id)
    if (!platform) return jsonError(res, 'no platform found with that id')

    const { username, password } = req.body
    const exists = await Account.findOne({ where: { user_id: req.user.id, platform_id: platform.id, username } })
    if (exists) return jsonError(res, 'an account with that username already exists')

    const account = await Account.create({
      user_id: req.user.id,
      platform_id: platform.id,
      username,
      password
    })
    jsonOk(res, account)
  }
  catch (error) { jsonError(res, error.message) }
}

const BOT_ACTIONS = ['start', 'stop']

export async function controlBot(req, res) {
  const validator = make(req.body, {
    account_id: 'required|integer',
    action: 'required|string|in:start,stop'
  })
  
  const account = Account.findByPk(req.body.account_id)
  if (!account) return jsonError(res, 'account not found')

  let bot = new UFTP(req.body.user, account)
  bot.once('finish', ()=> { bot = null })
  bot.start()
}