const { Op } = require('sequelize');
const { Appointment } = require('../db/models/appointment');
const { APPOINTMENT_STATUS } = require('../utils/constants');

const self = {
  createAppointment,
  getAppointmentById,
  getAppointmentsByUserId,
  updateAppointment,
};

module.exports = self;

async function getAppointmentById(id) {
  const appointment = await Appointment.findByPk(id);
  if (!appointment) {
    throw new Error(`Appointment ${id} not found.`);
  }
  return appointment;
}

async function getAppointmentsByUserId(userId) {
  const filters = {
    where: {
      userId,
    },
    raw: true,
  };
  return Appointment.findAll(filters);
}

async function createAppointment({
  arrivalTime,
  doctorId,
  officeId,
  userId,
}) {
  const existingAppt = await Appointment.findOne({
    where: {
      arrivalTime,
      [Op.or]: [
        { officeId },
        { doctorId },
        { userId },
      ],
    },
    raw: true,
  });
  if (existingAppt) {
    throw new Error('Cannot create an appointment at that time!');
  }

  return Appointment.create({
    arrivalTime,
    doctorId,
    officeId,
    userId,
    status: APPOINTMENT_STATUS.CREATED,
  });
}

function updateAppointment(id, updates) {
  const filters = { where: { id } };
  return Appointment.update(updates, filters);
}
