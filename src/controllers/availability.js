const _ = require('lodash');
const { Op } = require('sequelize');
const moment = require('moment');

const { FREQUENCIES, WEEKDAYS } = require('../utils/constants');
const { Availability } = require('../db/models/availability');
const { Doctor } = require('../db/models/doctor');

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

  // TODO: Check validUntil
  const availabilitiesInOffice = await Availability.findAll({
    where: {
      officeId,
      weekday,
      [Op.or]: [{
        startHour: {
          [Op.between]: [startHour, endHour], // TODO: Fix bug and make between range not inclusive
        },
      }, {
        endHour: {
          [Op.between]: [startHour, endHour],
        },
      }],
    },
  });
  if (availabilitiesInOffice.length > 0) {
    throw new Error('Selected hours are invalid. Office is occupied for that date in the selected hour range');
  }

  const existingAvailability = await Availability.findOne({
    where: {
      doctorId,
      weekday,
    },
    raw: true,
  });
  if (existingAvailability) {
    throw new Error(`Doctor ${doctorId} already has an availability on day ${weekday}`);
  }

  return Availability.create({
    doctorId,
    officeId,
    weekday,
    startHour,
    endHour,
    frequency,
    validUntil,
  });
}

async function getByDoctorId(doctorId) {
  const filters = {
    where: {
      doctorId,
    },
    raw: true,
  };
  return Availability.findAll(filters);
}

async function getAllRecords() {
  const response = await Availability.findAll({
    attributes: ['id', 'officeId', 'weekday', 'startHour', 'endHour', 'frequency', 'validUntil'],
    include: [{
      model: Doctor,
      attributes: ['id', 'firstName', 'lastName', 'specialty'],
    }],
  });
  return response;
}

async function editAvailability({
  id,
  frequency,
  validUntil,
}) {
  if (!frequency || !validUntil) {
    throw new Error('Cannot edit an availability without a valid frequency or valid until date');
  }

  const availability = await Availability.findOne({
    where: {
      id: {
        [Op.ne]: id,
      },
    },
    raw: true,
  });

  if (!availability) {
    throw new Error(`Availability "${id}" not found.`);
  }

  const filters = { where: { id } };
  return Availability.update({
    frequency,
    validUntil,
  }, filters);
}
