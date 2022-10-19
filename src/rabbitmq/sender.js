const logger = require('../logger');
const { getRabbitMQConnection } = require('./index');
const c = require('./constants');

async function sendMessageToExchange(event, payload) {
  try {
    const connection = getRabbitMQConnection();
    const channel = await connection.createChannel();
    await channel.assertExchange(
      c.USERS_APPOINTMENTS_EXCHANGE,
      c.DIRECT_EXCHANGE_TYPE,
      {
        durable: false,
      },
    );

    channel.publish(
      c.USERS_APPOINTMENTS_EXCHANGE,
      event,
      Buffer.from(JSON.stringify({ event, payload })),
    );
  } catch (error) {
    logger.error('Error while sending message to Rabbit MQ');
    logger.error(error);
  }
}

async function sendMessage(event, payload) {
  await sendMessageToExchange(event, payload);
}

module.exports = {
  sendMessage,
};
