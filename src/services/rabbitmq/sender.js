const logger = require('../../utils/logger');
const { getRabbitMQConnection } = require('./index');
const c = require('./constants');

async function sendMessageToExchange(event, payload) {
  try {
    const connection = getRabbitMQConnection();
    const channel = await connection.createChannel();
    await channel.assertExchange(
      c.HEALY_EXCHANGE,
      c.DIRECT_EXCHANGE_TYPE,
      {
        durable: true,
      },
    );

    channel.publish(
      c.HEALY_EXCHANGE,
      event,
      Buffer.from(JSON.stringify({ event, payload })),
    );
    channel.close();
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
