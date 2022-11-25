/* eslint-disable no-param-reassign */
const { Op } = require('sequelize');
const _ = require('lodash');
const moment = require('moment');

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
  getAppointmentsByUserId,
  userUpdateAppointment,
  deleteAppointment,
  getAllAppointments,
  startChat,
  getAppointmentsInInterval,
  doctorAppointmentCancelation,
  doctorDayCancelation,
  userConfirmAppointment,
  getHistoryBetween,
  upsertNotes,
};

module.exports = self;

async function getAppointmentsByUserId(userId, isDoctor) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const where = isDoctor ? { doctorId: userId } : { userId };
  const filters = {
    where,
    attributes: ['id', 'arrivalTime', 'status', 'doctorId', 'timesModifiedByUser', 'officeId'],
    include: [{
      model: Doctor,
      attributes: ['firstName', 'lastName', 'specialty'],
    },
    {
      model: User,
    }],
  };
  return Appointment.findAll(filters);
}

async function createAppointment({
  arrivalTime,
  doctorId,
  officeId,
  userId,
  isExtraAppt,
}, isAdmin) {
  let extraApptDt = null;
  const extraAppt = isExtraAppt && isAdmin;
  if (!extraAppt) {
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

    // TODO: Fix this
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
  } else {
    extraApptDt = extraAppt ? arrivalTime : null;
    arrivalTime = null;
  }

  return Appointment.create({
    arrivalTime,
    doctorId,
    officeId,
    userId,
    extraAppt: extraApptDt,
    status: APPOINTMENT_STATUS.CONFIRMED,
  });
}

async function userUpdateAppointment(id, updates) {
  if (!id) {
    throw new Error('Appointment ID is required');
  }

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

  const existingAppt = await Appointment.findOne(filters);
  if (!existingAppt) {
    throw new Error(`Appointment "${id}" not found.`);
  }

  return Appointment.update({
    ...updates,
    timesModifiedByUser: existingAppt.timesModifiedByUser + 1,
  }, filters);
}

async function editAppointment({
  id,
  status,
}) {
  if (!id) {
    throw new Error('Appointment ID is required');
  }

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
  if (!id) {
    throw new Error('Appointment ID is required');
  }

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

async function getAppointmentsInInterval(days) {
  const appointments = await Appointment.findAll({
    attributes: ['arrivalTime', 'doctorId', 'userId'],
    where: {
      status: APPOINTMENT_STATUS.CONFIRMED,
      arrivalTime: {
        [Op.between]: [moment().format(), moment().add(days, 'days').format()],
      },
    },
  });
  return appointments;
}

async function doctorAppointmentCancelation(apptId) {
  const appt = await Appointment.findByPk(apptId);
  appt.update({ status: APPOINTMENT_STATUS.CANCELLED });

  const unavailableSlots = {};
  const appointments = await Appointment.getAllAppointmentsForDoctor(appt.doctorId);
  appointments.forEach((ap) => {
    unavailableSlots[ap.arrivalTime.getTime()] = true;
  });

  const [availabilities, offices] = await Availability.getAllAvailableSlotsForDoctor(appt.doctorId);
  let newDate;
  availabilities.every((a) => {
    if (!unavailableSlots[a.getTime()]) {
      newDate = a;
      // console.log(newDate);
      return false;
    }
    return true;
  });

  sendMessage(queueConstants.APPT_CANCEL_BY_DOCTOR, {
    proposedTime: newDate,
    oldTime: appt.arrivalTime,
    userId: appt.userId,
    doctorId: appt.doctorId,
  });

  return Appointment.create({
    arrivalTime: newDate,
    doctorId: appt.doctorId,
    officeId: offices[newDate.getDay()],
    userId: appt.userId,
    // extraAppt: extraApptDt,
    status: APPOINTMENT_STATUS.TO_CONFIRM,
  });
}

async function doctorDayCancelation(doctorId, dateString) {
  const [nUpdatedAppts, appts] = await Appointment.update({
    status: APPOINTMENT_STATUS.CANCELLED,
  }, {
    where: {
      doctorId,
      arrivalTime: {
        [Op.between]: [
          new Date(dateString),
          new Date(`${dateString} 23:59`),
        ],
      },
    },
    returning: true,
  });

  const newProposedAppts = [];
  const unavailableSlots = {};
  const appointments = await Appointment.getAllAppointmentsForDoctor(doctorId);
  appointments.forEach((ap) => {
    unavailableSlots[ap.arrivalTime.getTime()] = true;
  });

  const [availabilities, offices] = await Availability.getAllAvailableSlotsForDoctor(doctorId);
  availabilities.every((a) => {
    if (!unavailableSlots[a.getTime()] && a.toJSON().slice(0, 10) !== dateString) {
      newProposedAppts.push(a);
      unavailableSlots[a.getTime()] = true;
    }
    return newProposedAppts.length !== nUpdatedAppts;
  });

  const updateMsgs = [];
  appts.forEach((a, idx) => {
    Appointment.create({
      arrivalTime: newProposedAppts[idx],
      doctorId: a.doctorId,
      officeId: offices[newProposedAppts[idx].getDay()],
      userId: a.userId,
      // extraAppt: extraApptDt,
      status: APPOINTMENT_STATUS.TO_CONFIRM,
    });
    updateMsgs.push({
      doctorId: a.doctorId,
      userId: a.userId,
      proposedTime: newProposedAppts[idx],
      oldTime: a.arrivalTime,
    });
  });

  sendMessage(queueConstants.DAY_CANCEL_BY_DOCTOR, updateMsgs);
}

async function userConfirmAppointment(apptId) {
  if (!apptId) {
    throw new Error('Appointment ID is required');
  }

  return Appointment.update({
    status: APPOINTMENT_STATUS.CONFIRMED,
  }, {
    where: { id: apptId },
  });
}

async function getHistoryBetween({ doctorId, userId }) {
  const appointments = await Appointment.findAll({
    where: {
      userId,
      doctorId,
    },
    include: [{
      model: User,
      attributes: ['firstName', 'lastName'],
    }, {
      model: Doctor,
      attributes: ['firstName', 'lastName', 'specialty'],
    }],
    order: [
      ['arrivalTime', 'ASC'],
    ],
  });

  return appointments;
}

async function upsertNotes(apptId, payload) {
  if (!apptId) {
    throw new Error('Appointment ID is required');
  }

  if (!payload.notes) {
    throw new Error('You must provide notes');
  }

  await Appointment.update(
    {
      notes: payload.text,
    },
    {
      where: {
        id: apptId,
      },
    },
  );
}
