const { Sequelize } = require('sequelize');
const config = require('../config');

const sequelize = new Sequelize(
  config.PG_DB,
  config.PG_USER,
  config.PG_PASSWORD,
  {
    host: config.PG_HOST,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    pool: { maxConnections: 5, maxIdleTime: 30 },
  },
);

module.exports = { sequelize };
