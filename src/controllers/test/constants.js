/* eslint-disable max-len */
/*
  Why do we need these constants? The main issue is to prevent mistakes in mixing up params. For example, if I had a
  method that looks like `myMethod(accountId, userId)`, but I pass `1` to both params, I have no idea if the account id
  was passed as the first or second param, so my test could pass, but the logic could be wrong. To prevent this, we have
  set ids for each type of thing that are all unique.
*/
const _ = require('lodash');

// we reserve 1-500 for any ids manually defined during tests

const APPOINTMENT_IDS = _.range(500, 511); // 500-510
const APPOINTMENT_ID = APPOINTMENT_IDS[0];

const DOCTOR_IDS = _.range(511, 531); // 511-530
const DOCTOR_ID = DOCTOR_IDS[0];

const OFFICE_IDS = _.range(531, 561); // 531-560
const OFFICE_ID = OFFICE_IDS[0];
const OFFICE_NUMBER = 1000;

const AVAILABILITY_IDS = _.range(561, 591); // 561-590
const AVAILABILITY_ID = AVAILABILITY_IDS[0];

const VALID_UNTIL_DATE = new Date(2030, 1, 1);

module.exports = {
  APPOINTMENT_IDS,
  APPOINTMENT_ID,

  DOCTOR_IDS,
  DOCTOR_ID,

  OFFICE_IDS,
  OFFICE_ID,
  OFFICE_NUMBER,

  AVAILABILITY_IDS,
  AVAILABILITY_ID,

  VALID_UNTIL_DATE,
};
