const config = require('../../config');

module.exports = {
  production: {
    username: config.PG_USER,
    password: config.PG_PASSWORD,
    database: config.PG_DB,
    host: config.PG_HOST,
    port: 5432,
    dialect: 'postgres',
    dialectOptions: {
      bigNumberStrings: true,
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
  development: {
    username: config.PG_USER,
    password: config.PG_PASSWORD,
    database: config.PG_DB,
    host: config.PG_HOST,
    port: 5432,
    dialect: 'postgres',
    dialectOptions: {
      bigNumberStrings: true,
    },
  },
};
