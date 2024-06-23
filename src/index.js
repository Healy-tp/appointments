const app = require('./app');
const config = require('./config');
const logger = require('./utils/logger');
const { establishConnectionWithRabbitMQ } = require('./services/rabbitmq');

const { sequelize } = require('./db/dbsetup');
const models = require('./db/models');

const start = async () => {
  if (!config.PG_USER || !config.PG_PASSWORD || !config.PG_HOST || !config.PG_DB) {
    throw new Error('PG_USER, PG_PASSWORD, PG_HOST and PG_DB must be defined');
  }

  try {
    await sequelize.authenticate();
    models.associate();

    logger.info('Connection has been established successfully.');
  } catch (err) {
    logger.error('Unable to connect to DB: ', err);
  }

  app.listen(config.PORT, () => {
    logger.info(`Appointments service listening on port ${config.PORT}`);
  });
};

start();

establishConnectionWithRabbitMQ();
