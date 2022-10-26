import { encryptPass } from "../utils.js";
import { sequelize } from "./relations.js";
const { User, Platform } = sequelize.models

export async function seed() {
  const platform = await Platform.bulkCreate([
    {name:'UFTP', base_url:'https://www.uftp.vip', root_user:'927448868', root_pass:'s0nsam0sha', details: {prefix:'+51'}},
    {name:'WOTC', base_url:'https://www.worldotc.com', root_user:'927448868', root_pass:'s0nsam0sha', details: {prefix:'+51'}}
  ])

  const users = await User.bulkCreate([
    {names:'antonio muelle', username:'antomuelle', email:'mguzman.muelle@gmail.com', password:await encryptPass('s0nsam0sha'), type: 10},
    {names:'pedro suarez', username:'pedrosu', email:'otroemail@gmail.com', password:await encryptPass('sharedpass'), type: 0}
  ])

  for (let i=0; i<users.length; i++) {
    const user = users[i]
    user.addPlatform(platform[0], { through: { username: 'userone', password: 'plainpass'}})
    user.addPlatform(platform[0], { through: { username: 'usertwo', password: 'plainpass'}})
    user.addPlatform(platform[1], { through: { username: 'userclone', password: 'passonother' }})
  }
}