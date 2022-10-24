/** @typedef { import('express').Request } Request */
/** @typedef { import('express').Response } Response */
import { make } from "simple-body-validator"
import User from "../models/User.js"
import { encryptPass, jsonError, jsonOk } from "../utils.js"
import { Op } from "sequelize"

export function login(req, res) {
  jsonOk(res, 'login success')
}

const register_rules = {
  names: 'required|string|min:4',
  username: 'required|string|min:4',
  email: 'required|email',
  password: 'required|string|min:5|max:255'
}

/**
 * @param {Request} req 
 * @param {Response} res 
 */
export async function register(req, res) {
  const validator = make(req.body, register_rules)
  
  if ( !validator.validate())
    return jsonError(res, { errors: validator.errors().all() })

  const body = req.body
  let user = await User.findOne({ where: { [Op.or]: [{ username: body.username }, { email: body.email }] }})
  if (user)
    return jsonError(res, 'the user already exists')

  User.create({
    names: body.names,
    username: body.username,
    email: body.email,
    password: await encryptPass(body.password),
  })
  jsonOk(res, 'user created successfully')
}

/**
 * @param {Request} req 
 * @param {Response} res 
 */
export function logout(req, res, next) {
  req.logout( (error)=> {
    if (error) { return next(error) }
    res.redirect('/login-out')
  })
}