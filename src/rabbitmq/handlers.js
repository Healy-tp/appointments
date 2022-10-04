const c = require('./constants');
const logger = require('../logger');
const { User } = require('../db/models/user');
const { Doctor } = require('../db/models/doctor');

async function processUserCreatedEvent(content) {
  const { firstName, lastName, id } = content.payload;
  await User.create({ firstName, lastName, id });
  logger.info('Successfully procesed USER_CREATED event');
}

async function processDoctorCreatedEvent(content) {
  const { firstName, lastName, id, specialty } = content.payload;
  await Doctor.create({ firstName, lastName, id, status: 'pending', specialty });
  logger.info('Successfully procesed DOCTOR_CREATED event');
}

async function processDoctorConfirmedEvent({ id }) {
  const doctor = await Doctor.findOne({ where: { id } });
  doctor.status = 'active';
  doctor.save();
  logger.info('Successfully procesed DOCTOR_CONFIRMED event');
}

function handleData(data) {
  const content = JSON.parse(data.content);
  switch (content.event) {
    case c.USER_CREATED_EVENT:
      processUserCreatedEvent(content);
      break;

    case c.DOCTOR_CREATED_EVENT:
      processDoctorCreatedEvent(content);
      break;

    case c.DOCTOR_CONFIRMED_EVENT:
      processDoctorConfirmedEvent(content.payload);
      break;

    default:
      logger.info('Unrecogonized message');
      break;
  }
}

module.exports = {
  handleData,
};
