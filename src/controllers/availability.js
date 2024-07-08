const crypto = require('crypto');
const moment = require('moment');
const { Op } = require('sequelize');
const _ = require('lodash');

const { FREQUENCIES, WEEKDAYS } = require('../utils/constants');
const { Availability } = require('../db/models/availability');
const { Doctor } = require('../db/models/doctor');
const { Office } = require('../db/models/office');
const { sequelize } = require('../db/dbsetup');

const self = {
  createAvailability,
  getByDoctorId,
  getAllRecords,
  editAvailability,
};

module.exports = self;

async function createAvailability({
  doctorId,
  officeId,
  weekday,
  startHour,
  endHour,
  frequency,
  validUntil,
}) {
  const transaction = await sequelize.transaction();
  try {
    if (weekday < WEEKDAYS.MONDAY || weekday > WEEKDAYS.SATURDAY) {
      throw new Error(`Weekday "${weekday}" is invalid`);
    }

    if (!_.includes(FREQUENCIES, frequency)) {
      throw new Error(`Frequency "${frequency} mins." is not valid`);
    }

    const isExpired = moment(validUntil).isBefore(moment());
    if (isExpired) {
      throw new Error('Selected availability date is already expired');
    }

    const availabilitiesInOffice = await Availability.findAll({
      where: {
        officeId,
        weekday,
        [Op.or]: [{
          startHour: {
            [Op.between]: [`${startHour}:01`, `${endHour - 1}:59`],
          },
        }, {
          endHour: {
            [Op.between]: [`${startHour}:01`, `${endHour - 1}:59`],
          },
        }],
        validUntil: {
          [Op.gte]: moment().format('YYYY-MM-DD'),
        },
      },
      transaction,
    });

    if (!_.isEmpty(availabilitiesInOffice)) {
      throw new Error('Office is occupied for that date in the selected hour range');
    }

    const existingAvailability = await Availability.findOne({
      where: {
        doctorId,
        weekday,
      },
      raw: true,
      transaction,
    });

    if (!_.isEmpty(existingAvailability)) {
      throw new Error(`Doctor ${doctorId} already has an availability on day ${weekday}`);
    }

    const startHourTime = `${startHour}:00`;
    const endHourTime = `${endHour}:00`;
    const newAvailability = await Availability.create({
      id: crypto.randomUUID(),
      doctorId,
      officeId,
      weekday,
      startHour: startHourTime,
      endHour: endHourTime,
      frequency,
      validUntil,
    }, { transaction });
    await transaction.commit();
    return newAvailability;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

async function getByDoctorId(doctorId) {
  const transaction = await sequelize.transaction();
  try {
    if (!doctorId) {
      throw new Error('Doctor ID is required');
    }

    const filters = {
      where: {
        doctorId,
      },
      include: [{ model: Office }],
      transaction,
    };
    const availabilities = await Availability.findAll(filters);
    await transaction.commit();
    return availabilities;
  } catch (err) {
    transaction.rollback();
    throw err;
  }
}

async function getAllRecords() {
  const transaction = await sequelize.transaction();
  try {
    const response = await Availability.findAll({
      attributes: ['id', 'officeId', 'weekday', 'startHour', 'endHour', 'frequency', 'validUntil'],
      include: [{
        model: Doctor,
        attributes: ['id', 'firstName', 'lastName', 'specialty'],
      },
      {
        model: Office,
      }],
    });
    await transaction.commit();
    return response;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

async function editAvailability({
  id,
  frequency,
  validUntil,
}) {
  const transaction = await sequelize.transaction();
  try {
    if (!id) {
      throw new Error('Availability ID is required');
    }

    if (!frequency || !validUntil) {
      throw new Error('Cannot edit an availability without a valid frequency or valid until date');
    }

    const availability = await Availability.findOne({
      where: {
        id,
      },
      transaction,
      raw: true,
    });

    if (!availability) {
      throw new Error(`Availability "${id}" not found.`);
    }

    const filters = { where: { id }, transaction };
    const updatedAvailability = await Availability.update({
      frequency,
      validUntil,
    }, filters);
    await transaction.commit();
    return updatedAvailability;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}
