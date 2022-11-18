const { SPECIALTIES } = require('@healy-tp/common');
const { OFFICE_ID, OFFICE_NUMBER } = require('../test/constants');

const fakeOffice = {
  id: OFFICE_ID,
  specialties: [SPECIALTIES.CARDIOLOGY],
  number: OFFICE_NUMBER,
};

function getAllOffices() {
  return [fakeOffice];
}

module.exports = {
  getAllOffices,

  fakeOffice,
};
