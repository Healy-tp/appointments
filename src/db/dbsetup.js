const { Sequelize } = require('sequelize');
const config = require('../config');

let opts = {
  host: config.PG_HOST,
  dialect: 'postgres',
};

if (config.NODE_ENV !== 'development') {
  opts = {
    ...opts,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    pool: { maxConnections: 5, maxIdleTime: 30 },
  };
}

const sequelize = new Sequelize(
  config.PG_DB,
  config.PG_USER,
  config.PG_PASSWORD,
  opts,
);

module.exports = { sequelize };
