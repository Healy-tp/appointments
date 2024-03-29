const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  ACTIVE_ENV: process.env.ACTIVE_ENV || 'development',
  PORT: process.env.PORT || 8080,
  PG_USER: process.env.POSTGRES_USER,
  PG_PASSWORD: process.env.POSTGRES_PASSWORD,
  PG_DB: process.env.POSTGRES_DB,
  PG_HOST: process.env.POSTGRES_HOST,
  RMQ_HOST: process.env.RMQ_HOST,
};
