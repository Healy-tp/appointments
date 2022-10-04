const logger = require('../logger');
const { getRabbitMQConnection } = require('./index');
const c = require('./constants');

async function sendMessageToAppointments(event, payload) {
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
  switch (event) {
    case 'CHAT_STARTED':
      await sendMessageToAppointments(event, payload);
      break;

    default:
      logger.warning('Unrecogonized message');
      break;
  }
}

module.exports = {
  sendMessage,
};
