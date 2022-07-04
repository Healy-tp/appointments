const { Appointment } = require('../db/models/appointment');

const self = {
  getAppointmentById,
};

module.exports = self;

function getAppointmentById(id) {
  return Appointment.findByPk(id);
}
