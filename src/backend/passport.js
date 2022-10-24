import passport from "passport";
import local from 'passport-local'
import User from "./models/User.js";
import { validatePass } from "./utils.js";

const LocalStrategy = local.Strategy

passport.use(new LocalStrategy( async (username, password, cb)=> {
  try {
    const user = await User.findOne({ where: { username } })
    if (!user) return cb(null, false)
    const is_valid = await validatePass(password, user.password)
    return cb(null, is_valid ? user : false)
  }
  catch (error) { cb(error) }
}))

passport.serializeUser( (user, cb)=> { cb(null, user.id) })

passport.deserializeUser( async (id, cb)=> {
  const user = await User.findByPk(id)
  if (!user) cb(new Error('no user found'))
  else cb(null, user)
})

export default passport