const { SPECIALTIES } = require('@healy-tp/common');
const { DOCTOR_ID } = require('../test/constants');

const fakeDoctor = {
  id: DOCTOR_ID,
  firstName: 'John',
  lastName: 'Doe',
  status: 'active',
  specialty: [SPECIALTIES.CARDIOLOGY],
};

function getDoctors() {
  return [fakeDoctor];
}

module.exports = {
  getDoctors,
};
