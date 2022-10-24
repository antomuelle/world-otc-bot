import { Sequelize } from 'sequelize'

const db_name = 'lazybot'
const db_user = 'root'
const db_pass = 'd3bugp@ssword'
const db_host = 'localhost'

export const connection = new Sequelize(
  db_name,
  db_user,
  db_pass,
  { host: db_host, dialect: 'mysql', logging: false }
)