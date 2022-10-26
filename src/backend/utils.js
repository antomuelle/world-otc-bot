import bcrypt from 'bcrypt'

/** @typedef { import('express').Response } Response */

export async function validatePass(password, hash) {
  return await bcrypt.compare(password, hash)
}

export async function encryptPass(password) {
  return await bcrypt.hash(password, 8)
}

/** @param { Response } res */
export function jsonOk(res, data = null, status = 200, headers = null) {
  json('ok', res, data, status, headers)
}

/** @param { Response } res */
export function jsonError(res, data = null, status = 400, headers = null) {
  json('error', res, data, status, headers)
}

/** @param { Response } res */
function json(state, res, data, status, headers) {
  let response = { state }
  
  if ( data === null ) {
    if (state == 'ok')
      response.data = null
  }
  else if (typeof data === 'string')
    response.message = data
  else if (data.constructor === Object)
    response = { state, ...data }
  else
    response = { state, data }
  
  if (headers) res.header(headers)
  res.status(status).json(response)
}

export function parseTime(time) {
  time = parseInt(time / 1000)
  const h = parseInt(time / 3600)
  const m = parseInt((time % 3600) / 60)
  const s = parseInt(time % 60)
  return `${ h<10?'0'+h:h }:${ m<10?'0'+m:m }:${ s<10?'0'+s:s }`
}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}