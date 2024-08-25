const amqplib = require('amqplib');
const config = require('../../config');
const logger = require('../../utils/logger');
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
      c.HEALY_EXCHANGE,
      c.DIRECT_EXCHANGE_TYPE,
      {
        durable: true,
      },
    );

    const r = channel.assertQueue(c.APPTS_QUEUE, {
      exclusive: false,
      autoDelete: false,
      durable: true,
    });

    channel.bindQueue(c.APPTS_QUEUE, c.HEALY_EXCHANGE, c.USER_CREATED_EVENT);
    channel.bindQueue(c.APPTS_QUEUE, c.HEALY_EXCHANGE, c.USER_UPDATED_EVENT);
    channel.bindQueue(c.APPTS_QUEUE, c.HEALY_EXCHANGE, c.DOCTOR_CREATED_EVENT);
    channel.bindQueue(c.APPTS_QUEUE, c.HEALY_EXCHANGE, c.DOCTOR_CONFIRMED_EVENT);

    await channel.consume(r.queue, (data) => {
      try {
        handleData(data);
        channel.ack(data);
      } catch (err) {
        logger.error('Error processing RabbitMQ Event', err);
      }
    }, {
      noAck: false,
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
