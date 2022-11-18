const { DOCTOR_ID, OFFICE_ID, AVAILABILITY_ID } = require('../test/constants');
const { FREQUENCIES, WEEKDAYS } = require('../../utils/constants');

const fakeAvailability = {
  id: AVAILABILITY_ID,
  doctorId: DOCTOR_ID,
  officeId: OFFICE_ID,
  weekday: WEEKDAYS.MONDAY,
  startHour: '13:00:00',
  endHour: '16:00:00',
  frequency: FREQUENCIES[0],
  validUntil: new Date(2030, 1, 1),
  extraAppts: 5,
};

function createAvailability() {
  return fakeAvailability;
}

function getAllRecords() {
  return [fakeAvailability];
}

function getByDoctorId(doctorId) {
  if (doctorId === DOCTOR_ID) {
    return [fakeAvailability];
  }
  return [];
}

module.exports = {
  createAvailability,
  getAllRecords,
  getByDoctorId,

  fakeAvailability,
};
