/* eslint-disable no-param-reassign */
const { Op, literal } = require('sequelize');
const _ = require('lodash');
const { Appointment } = require('../db/models/appointment');
const { Availability } = require('../db/models/availability');
const { Doctor } = require('../db/models/doctor');
const { User } = require('../db/models/user');
const { sendMessage } = require('../rabbitmq/sender');
const queueConstants = require('../rabbitmq/constants');
const { APPOINTMENT_STATUS } = require('../utils/constants');

const self = {
  createAppointment,
  editAppointment,
  getAppointmentById,
  getAppointmentsByUserId,
  updateAppointment,
  deleteAppointment,
  getAllAppointments,
  startChat,
};

module.exports = self;

async function getAppointmentById(id) {
  const appointment = await Appointment.findByPk(id);
  if (!appointment) {
    throw new Error(`Appointment ${id} not found.`);
  }
  return appointment;
}

async function getAppointmentsByUserId(userId, isDoctor) {
  const where = isDoctor ? { doctorId: userId} : { userId };
  const filters = {
    where,
    attributes: ['id', 'arrivalTime', 'status', 'doctorId', 'timesModifiedByUser', 'officeId'],
    include: [{
      model: Doctor,
      attributes: ['firstName', 'lastName', 'specialty'],
    },
    {
      model: User,
    },
    ],
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

  const sameDayAppt = await Appointment.findOne({
    where: {
      userId,
      arrivalTime: {
        [Op.between]: [
          new Date(arrivalTimeDt.getTime()).setDate(arrivalTimeDt.getDate() - 1),
          new Date(arrivalTimeDt.getTime()).setDate(arrivalTimeDt.getDate() + 1),
        ],
      }
    },
  });

  if (sameDayAppt) {
    throw new Error('You already have an appointment for that day');
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

async function updateAppointment(id, isDoctor, updates) {
  const { arrivalTime, officeId } = updates;
  const arrivalTimeDt = new Date(arrivalTime);
  if (arrivalTimeDt < Date.now()) {
    throw new Error('Cannot create an appointment at a past time');
  }

  const filters = { where: { id } };
  const dates = await Availability.getAllSlots(arrivalTimeDt, officeId);
  if (!dates.includes(arrivalTimeDt.getTime())) {
    throw new Error('No slots available for the selected doctor at that time');
  }

  // if (isDoctor) {
  //   updates.status = APPOINTMENT_STATUS.TO_CONFIRM;
  // } else {
  //   updates.timesModifiedByUser = literal('"timesModifiedByUser" + 1');
  // }

  const existingAppt = await Appointment.findOne(filters);
  return existingAppt.update({
    ...updates,
    timesModifiedByUser: existingAppt.timesModifiedByUser + 1,
  });
}

async function editAppointment({
  id,
  status,
}) {
  if (!status || !_.includes(_.values(APPOINTMENT_STATUS), status)) {
    throw new Error('Cannot edit an appointment without a valid status');
  }

  const appt = await Appointment.findOne({
    where: {
      id,
    },
    raw: true,
  });

  if (!appt) {
    throw new Error(`Appointment "${id}" not found.`);
  }

  const filters = { where: { id } };
  return Appointment.update({
    status,
  }, filters);
}

async function deleteAppointment(id) {
  await Appointment.destroy({ where: { id } });
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

async function startChat(apptId) {
  const appt = await Appointment.findOne({ where: { id: apptId } });
  sendMessage(queueConstants.CHAT_STARTED_EVENT, {
    appointmentId: appt.id,
    userId: appt.userId,
    doctorId: appt.doctorId,
    arrivalTime: appt.arrivalTime,
  });
}
