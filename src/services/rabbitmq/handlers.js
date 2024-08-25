const rabbitMQConstants = require('./constants');
const logger = require('../../utils/logger');
const { User } = require('../../db/models/user');
const { Doctor } = require('../../db/models/doctor');
const { sequelize } = require('../../db/dbsetup');

async function processUserCreatedEvent(content, transaction) {
  const { firstName, lastName, id } = content.payload;
  await User.create({ firstName, lastName, id }, transaction);
  await transaction.commit();
  logger.info('Successfully processed USER_CREATED event');
}

async function processUserUpdatedEvent(content, transaction) {
  const { firstName, lastName, id } = content.payload;
  if (!content.payload.isDoctor) {
    await User.update({ firstName, lastName }, { where: { id }, transaction });
  } else {
    await Doctor.update({ firstName, lastName }, { where: { id }, transaction });
  }
  await transaction.commit();
  logger.info('Successfully processed USER_CREATED event');
}

async function processDoctorCreatedEvent(content, transaction) {
  const {
    firstName, lastName, id, specialty,
  } = content.payload;
  await Doctor.create({
    firstName, lastName, id, status: 'pending', specialty,
  }, transaction);
  await transaction.commit();
  logger.info('Successfully processed DOCTOR_CREATED event');
}

async function processDoctorConfirmedEvent({ id }, transaction) {
  const doctor = await Doctor.findOne({ where: { id }, transaction });
  doctor.status = 'active';
  doctor.save();
  await transaction.commit();
  logger.info('Successfully processed DOCTOR_CONFIRMED event');
}

async function handleData(data) {
  const content = JSON.parse(data.content);
  const transaction = await sequelize.transaction();
  try {
    switch (content.event) {
      case rabbitMQConstants.USER_CREATED_EVENT:
        processUserCreatedEvent(content, transaction);
        break;

      case rabbitMQConstants.DOCTOR_CREATED_EVENT:
        processDoctorCreatedEvent(content, transaction);
        break;

      case rabbitMQConstants.DOCTOR_CONFIRMED_EVENT:
        processDoctorConfirmedEvent(content.payload, transaction);
        break;

      case rabbitMQConstants.USER_UPDATED_EVENT:
        processUserUpdatedEvent(content, transaction);
        break;

      default:
        logger.info('Unrecogonized message');
        break;
    }
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

module.exports = {
  handleData,
};
