import { encryptPass } from "../utils.js";
import { sequelize } from "./relations.js";
const { User, Platform } = sequelize.models

export async function seed() {
  const platform = await Platform.create(
    {name:'UFTP', base_url:'https://www.uftp.vip', root_user:'927448868', root_pass:'s0nsam0sha', details: {prefix:'+51'}}
  )

  const user = await User.create(
    {names:'antonio muelle', username:'antomuelle', email:'mguzman.muelle@gmail.com', password:await encryptPass('s0nsam0sha')}
  )

  user.addPlatform(platform, { through: { username: 'userfunc' }})
  user.addPlatform(platform, { through: { username: 'otrouser' }})
}