const APPOINTMENT_STATUS = Object.freeze({
  CREATED: 'created',
  TO_CONFIRM: 'to_confirm',
  CANCELLED: 'cancelled',
  ATTENDED: 'attended',
});

const WEEKDAYS = Object.freeze({
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
});

// Each frequency is represented in minutes
const FREQUENCIES = [15, 30, 45, 60];

const MAX_APPOINTMENT_UPDATES = 3;

module.exports = {
  APPOINTMENT_STATUS,
  FREQUENCIES,
  MAX_APPOINTMENT_UPDATES,
  WEEKDAYS,
};
