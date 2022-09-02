const _ = require('lodash');
const moment = require('moment');

const { FREQUENCIES, WEEKDAYS } = require('../utils/constants');
const { Availability } = require('../db/models/availability');

const self = {
  createAvailability,
  getByDoctorId,
  getAllRecords,
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

  // TODO: add validation for office at that hour
  const existingAvailability = await Availability.findOne({
    where: {
      doctorId,
      weekday,
    },
    raw: true,
  });
  if (existingAvailability) {
    throw new Error(`Doctor ${doctorId} already have an availability on day ${weekday}`);
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
  const response = await Availability.findAll();
  return response;
}
