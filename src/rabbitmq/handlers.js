const c = require('./constants');
const logger = require('../logger');
const { User } = require('../db/models/user');

async function processUserCreatedEvent(content) {
  const { firstName, lastName, id } = content.payload;
  await User.create({ firstName, lastName, userId: id });
  logger.info('Successfully procesed USER_CREATED event');
}

function handleData(data) {
  const content = JSON.parse(data.content);
  switch (content.event) {
    case c.USER_CREATED_EVENT:
      processUserCreatedEvent(content);
      break;

    default:
      logger.info('Unrecogonized message');
      break;
  }
}

module.exports = {
  handleData,
};
