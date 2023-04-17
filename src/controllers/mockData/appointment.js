const { APPOINTMENT_STATUS } = require("../../utils/constants");



const fakeAppt1 = {
  id: 1,
  arrivalTime: '2022-12-18T12:00:00.000Z', 
  status: APPOINTMENT_STATUS.CONFIRMED,
  doctorId: 2,
  timesModifiedByUser: 1,
  officeId: 1,
  Doctor: {
    firstName: 'Test',
    lastName: 'Doctor',
    specialty: 'General',
  },
  User: {
    id: 2,
    firstName: 'Test',
    lastName: 'User',
  },
};

const fakeAppt2 = {
  id: 1,
  arrivalTime: '2022-12-18T12:30:00.000Z',
  status: APPOINTMENT_STATUS.CONFIRMED,
  doctorId: 2,
  timesModifiedByUser: 1,
  officeId: 1,
  Doctor: {
    firstName: 'Test',
    lastName: 'Doctor',
    specialty: 'General',
  },
  User: {
    id: 2,
    firstName: 'Test',
    lastName: 'User',
  },
};

function getMockAppointments() {
  return [fakeAppt1, fakeAppt2];
}

module.exports = {
  getMockAppointments,
};
