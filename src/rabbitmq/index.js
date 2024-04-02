const amqplib = require('amqplib');
const config = require('../config');
const logger = require('../logger');
const c = require('./constants');
const { handleData } = require('./handlers');

let connection;

async function establishConnectionWithRabbitMQ() {
  try {
    const amqpServer = `${config.RMQ_PROTOCOL}://${config.RMQ_HOST}:${config.RMQ_PORT}`;
    const opt = { credentials: amqplib.credentials.plain(config.RMQ_USER, config.RMQ_PASSWORD) };
    connection = await amqplib.connect(amqpServer, opt);
    logger.info('Successfully connected to Rabbit MQ.');
    const channel = await connection.createChannel();
    await channel.assertExchange(
      c.USERS_APPOINTMENTS_EXCHANGE,
      c.DIRECT_EXCHANGE_TYPE,
      {
        durable: false,
      },
    );

    const r = channel.assertQueue('', {
      exclusive: true,
    });

    channel.bindQueue(r.queue, c.USERS_APPOINTMENTS_EXCHANGE, c.USER_CREATED_EVENT);
    channel.bindQueue(r.queue, c.USERS_APPOINTMENTS_EXCHANGE, c.USER_UPDATED_EVENT);
    channel.bindQueue(r.queue, c.USERS_APPOINTMENTS_EXCHANGE, c.DOCTOR_CREATED_EVENT);
    channel.bindQueue(r.queue, c.USERS_APPOINTMENTS_EXCHANGE, c.DOCTOR_CONFIRMED_EVENT);

    await channel.consume(r.queue, (data) => {
      handleData(data);
      channel.ack(data);
    });
  } catch (error) {
    logger.error(error);
  }
}

function getRabbitMQConnection() {
  return connection;
}

module.exports = {
  establishConnectionWithRabbitMQ,
  getRabbitMQConnection,
};
