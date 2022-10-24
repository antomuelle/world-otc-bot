/** @typedef { import('express').Request } Request */
/** @typedef { import('express').Response } Response */

import { QueryTypes } from 'sequelize';
import { make } from 'simple-body-validator';
import { sequelize } from '../database/relations.js';
import { jsonError, jsonOk } from '../utils.js';

const { Account, Platform, User } = sequelize.models

export async function allPlatforms(req, res) {
  try {
    jsonOk(res, await Platform.findAll({
      attributes: { exclude: ['root_user', 'root_pass', 'details'] },
      where: { active: 1 }
    }))
  }
  catch (error) { jsonError(res, error.message )}
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

export async function _(req, res) {}

export async function updateToken(req, res) {
  const validator = make(req.body, {
    id: 'required|integer',
    token: 'required|string'
  })
  if (!validator) return jsonError(res)

  try {
    const account = await Account.findByPk(req.body.id)
    if (!account)
      return jsonError(res, 'the account does not exists')
    
    await account.update({ session: { ...account.session, token: req.body.token } })
    jsonOk(res, 'token updated')
  }
  catch (error) { jsonError(res, error.message) }
}