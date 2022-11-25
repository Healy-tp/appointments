const {
  APPOINTMENT_ID, DOCTOR_ID, OFFICE_ID, USER_ID,
} = require('../test/constants');
const { APPOINTMENT_STATUS } = require('../../utils/constants');

const fakeAppointment = {
  id: APPOINTMENT_ID,
  doctorId: DOCTOR_ID,
  officeId: OFFICE_ID,
  status: APPOINTMENT_STATUS.CONFIRMED,
  arrivalTime: '2022-11-29T14:00:00.000Z',
  timesModifiedByUser: 0,
};

function getAppointmentsByUserId(userId) {
  if (userId === USER_ID) {
    return [fakeAppointment];
  }
  return [];
}

module.exports = {
  getAppointmentsByUserId,

  fakeAppointment,
};
