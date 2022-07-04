const { Sequelize } = require('sequelize');
const config = require('../config');

const sequelize = new Sequelize(`postgres://${config.PG_USER}:${config.PG_PASSWORD}@${config.PG_HOST}:5432/${config.PG_DB}`);

module.exports = { sequelize };
