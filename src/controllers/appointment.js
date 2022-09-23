/* eslint-disable no-param-reassign */
const { Op, literal } = require('sequelize');
const { Appointment } = require('../db/models/appointment');
const { Availability } = require('../db/models/availability');
const { Doctor } = require('../db/models/doctor');
const { User } = require('../db/models/user');
const { APPOINTMENT_STATUS } = require('../utils/constants');

const self = {
  createAppointment,
  getAppointmentById,
  getAppointmentsByUserId,
  updateAppointment,
  getAllAppointments,
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
  const arrivalTimeDt = new Date(arrivalTime);
  if (arrivalTimeDt < Date.now()) {
    throw new Error('Cannot create an appointment at a past time');
  }

  const existingAppt = await Appointment.findOne({
    where: {
      arrivalTime: arrivalTimeDt,
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

  const dates = await Availability.getAllSlots(arrivalTimeDt, officeId);
  if (!dates.includes(arrivalTimeDt.getTime())) {
    throw new Error('No slots available for the selected doctor at that time');
  }

  return Appointment.create({
    arrivalTime,
    doctorId,
    officeId,
    userId,
    status: APPOINTMENT_STATUS.CREATED,
  });
}

function updateAppointment(id, isDoctor, updates) {
  const filters = { where: { id } };

  if (isDoctor) {
    updates.status = APPOINTMENT_STATUS.TO_CONFIRM;
  } else {
    updates.timesModifiedByUser = literal('"timesModifiedByUser" + 1');
  }

  return Appointment.update(updates, filters);
}

async function getAllAppointments(forAdmin = false) {
  const params = !forAdmin ? {
    attributes: ['doctorId', 'arrivalTime'],
  } : {
    include: [{ model: Doctor }, { model: User }],
  };
  const response = await Appointment.findAll(params);

  return response;
}
