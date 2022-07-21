const APPOINTMENT_STATUS = Object.freeze({
  CREATED: 'created',
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
const FREQUENCIES = [30, 45, 60];

module.exports = {
  APPOINTMENT_STATUS,
  FREQUENCIES,
  WEEKDAYS,
};
