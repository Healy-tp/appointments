/* eslint-disable no-param-reassign */
const crypto = require('crypto');

const moment = require('moment');
const { Op } = require('sequelize');
const _ = require('lodash');

const { Appointment } = require('../db/models/appointment');
const { Availability } = require('../db/models/availability');
const { Doctor } = require('../db/models/doctor');
const { User } = require('../db/models/user');
const { Office } = require('../db/models/office');
const pdfGenerator = require('../services/pdf-generator');
const rmq = require('../services/rabbitmq/sender');
const queueConstants = require('../services/rabbitmq/constants');
const { APPOINTMENT_STATUS } = require('../utils/constants');
const { sequelize } = require('../db/dbsetup');

const self = {
  createAppointment,
  editAppointment,
  getAppointmentsByUserId,
  userUpdateAppointment,
  deleteAppointment,
  getAllAppointments,
  startChat,
  getAppointmentsInInterval,
  doctorAppointmentCancellation,
  doctorDayCancelation,
  userConfirmAppointment,
  getHistoryBetween,
  upsertNotes,
  markAssisted,
  exportPDF,
};

module.exports = self;

async function getAppointmentsByUserId(userId, isDoctor) {
  const transaction = await sequelize.transaction();
  try {
    const where = isDoctor ? { doctorId: userId } : { userId };
    const filters = {
      where,
      attributes: ['id', 'arrivalTime', 'status', 'doctorId', 'timesModifiedByUser', 'officeId', 'extraAppt'],
      include: [{
        model: Doctor,
        attributes: ['firstName', 'lastName', 'specialty'],
      },
      {
        model: User,
      },
      {
        model: Office,
      }],
    };
    const appointments = await Appointment.findAll({
      ...filters, transaction,
    });
    await transaction.commit();
    return appointments;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

async function createAppointment({
  arrivalTime,
  doctorId,
  officeId,
  userId,
  isExtraAppt,
}, isAdmin) {
  const transaction = await sequelize.transaction();
  try {
    if (!arrivalTime || !doctorId || !userId) {
      throw new Error('Missing required fields');
    }

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
        transaction,
      });

      if (existingAppt) {
        throw new Error('Cannot create an appointment at that time!');
      }

      const sameDayAppt = await Appointment.findOne({
        where: {
          userId,
          arrivalTime: {
            [Op.between]: [moment(arrivalTimeDt).startOf('day').toDate(), moment(arrivalTimeDt).endOf('day').toDate()],
          },
        },
        transaction,
      });

      if (sameDayAppt) {
        throw new Error('You already have an appointment for that day');
      }

      const availableDates = await Availability.getAllSlots(arrivalTimeDt, officeId);
      if (!availableDates.includes(arrivalTimeDt.getTime())) {
        throw new Error('No slots available for the selected doctor at that time');
      }
    } else {
      extraApptDt = extraAppt ? arrivalTime.split(' ')[0] : null;
      arrivalTime = null;
    }

    const newAppointment = await Appointment.create({
      id: crypto.randomUUID(),
      arrivalTime,
      doctorId,
      officeId,
      userId,
      extraAppt: extraApptDt,
      status: APPOINTMENT_STATUS.CONFIRMED,
    }, {
      transaction,
    });
    await transaction.commit();
    return newAppointment;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

async function userUpdateAppointment(id, updates, userId) {
  const transaction = await sequelize.transaction();
  try {
    const { arrivalTime, officeId } = updates;
    const arrivalTimeDt = new Date(arrivalTime);
    if (arrivalTimeDt < Date.now()) {
      throw new Error('Cannot create an appointment at a past time');
    }

    const filters = { where: { id }, transaction };
    const dates = await Availability.getAllSlots(arrivalTimeDt, officeId, transaction);
    if (!dates.includes(arrivalTimeDt.getTime())) {
      throw new Error('No slots available for the selected doctor at that time');
    }

    const existingAppt = await Appointment.findOne({ ...filters });
    if (existingAppt.userId !== userId) {
      await transaction.commit();
      return false;
    }

    if (moment().add(3, 'days').isAfter(existingAppt.arrivalTime)) {
      throw new Error('Cannot update appointment within  72 hrs of arrival time');
    }

    const updatedAppt = await existingAppt.update({
      ...updates,
      timesModifiedByUser: existingAppt.timesModifiedByUser + 1,
    }, filters);
    await transaction.commit();
    return updatedAppt;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

async function editAppointment({
  id,
  status,
}) {
  const transaction = await sequelize.transaction();
  try {
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

    const filters = { where: { id }, transaction };
    const updatedAppt = await Appointment.update({
      status,
    }, filters);
    await transaction.commit();
    return updatedAppt;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

async function deleteAppointment(apptId, userId) {
  const transaction = await sequelize.transaction();
  try {
    const appt = await Appointment.findOne({ where: { id: apptId }, transaction });
    if (appt.userId !== userId) {
      await transaction.commit();
      return false
    };
    await Appointment.destroy({ where: { id: apptId }, transaction });
    await transaction.commit();
    return true;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

async function getAllAppointments(isAdmin = false) {
  const transaction = await sequelize.transaction();
  try {
    const params = !isAdmin ? {
      attributes: ['doctorId', 'arrivalTime'],
    } : {
      include: [{ model: Doctor }, { model: User }, {model: Office}],
    };
    const response = await Appointment.findAll({...params, transaction});
    await transaction.commit();
    return response;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

async function startChat(apptId) {
  const transaction = await sequelize.transaction();
  try {
    if (!apptId) {
      throw new Error('Appointment ID is required');
    }

    const appt = await Appointment.findOne({ where: { id: apptId }, transaction });
    if (!appt.canStartChat()) {
      throw new Error('You can only start a chat within 7 days of your appointment or 15 days past it.');
    }
    await transaction.commit();

    rmq.sendMessage(queueConstants.CHAT_STARTED_EVENT, {
      appointmentId: appt.id,
      userId: appt.userId,
      doctorId: appt.doctorId,
      arrivalTime: appt.arrivalTime,
    });
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

async function getAppointmentsInInterval(days) {
  const transaction = await sequelize.transaction();
  try {
    const appointments = await Appointment.findAll({
      attributes: ['arrivalTime', 'doctorId', 'userId'],
      where: {
        status: APPOINTMENT_STATUS.CONFIRMED,
        arrivalTime: {
          [Op.between]: [moment().format(), moment().add(days, 'days').format()],
        },
      },
      transaction,
    });
    await transaction.commit();
    return appointments;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

async function doctorAppointmentCancellation(apptId) {
  const transaction = await sequelize.transaction();
  try {
    const appt = await Appointment.findByPk(apptId, {transaction});
    appt.update({ status: APPOINTMENT_STATUS.CANCELLED, transaction });

    let [newDate, offices] = await Appointment.rescheduleAppointment(appt.doctorId, transaction);
    let isExtra;
    if (!newDate) {
      [newDate, isExtra] = await Appointment.rescheduleAppointmentUsingExtraSlots(appt.doctorId, transaction);
    }

    rmq.sendMessage(queueConstants.APPT_CANCEL_BY_DOCTOR, {
      proposedTime: newDate,
      oldTime: appt.arrivalTime,
      userId: appt.userId,
      doctorId: appt.doctorId,
    });

    const newAppt = await Appointment.create({
      id: crypto.randomUUID(),
      arrivalTime: !isExtra ? newDate : null,
      doctorId: appt.doctorId,
      officeId: offices[newDate.getDay()],
      userId: appt.userId,
      extraAppt: isExtra ? newDate : null,
      status: APPOINTMENT_STATUS.TO_CONFIRM,
    }, { transaction });
    await transaction.commit();
    return newAppt;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

async function doctorDayCancelation(doctorId, dateString) {
  const transaction = await sequelize.transaction();
  try {
    if (!doctorId) {
      throw new Error('Doctor ID is required');
    }

    const [canceledApptsCount, canceledAppts] = await Appointment.update({
      status: APPOINTMENT_STATUS.CANCELLED,
    }, {
      where: {
        doctorId,
        arrivalTime: {
          [Op.between]: [new Date(dateString), new Date(`${dateString} 23:59`)],
        },
      },
      transaction,
      returning: true,
    });

    const newProposedAppts = [];
    const unavailableSlots = {};
    const appointments = await Appointment.getAllAppointmentsForDoctor(doctorId, transaction);
    appointments.forEach((ap) => {
      unavailableSlots[ap.arrivalTime.getTime()] = true;
    });

    const [availabilities, offices] = await Availability.getAllAvailableSlotsForDoctor(doctorId, transaction);
    availabilities.every((a) => {
      if (!unavailableSlots[a.getTime()] && a.toJSON().slice(0, 10) !== dateString) {
        newProposedAppts.push(a);
        unavailableSlots[a.getTime()] = true;
      }
      return newProposedAppts.length !== canceledApptsCount;
    });

    if (newProposedAppts.length !== canceledApptsCount) {
      const extraApptsAvailable = await Availability.getAvailableExtraAppointments(doctorId, transaction);
      const extraAppts = await Appointment.getAllExtraAppointmentsForDoctor(doctorId, transaction);
      extraAppts.forEach((a) => {
        const x = new Date(a.dataValues.extraAppt);
        extraApptsAvailable[x.getTime()] = extraApptsAvailable[x.getTime()] - a.dataValues.count;
      });
      const sortedKeys = Object.keys(extraApptsAvailable).sort();
      sortedKeys.every((k) => {
        if (extraApptsAvailable[k] > 0) {
          newProposedAppts.push(new Date(parseInt(k)));
          unavailableSlots[new Date(parseInt(k)).getTime()] = true;
        }
        return newProposedAppts.length !== canceledApptsCount;
      });
    }

    const updateMsgs = [];
    await Promise.all(canceledAppts.map(async (a, idx) => {
      await Appointment.create({
        id: crypto.randomUUID(),
        arrivalTime: newProposedAppts[idx].getUTCHours() !== 0 ? newProposedAppts[idx] : null,
        doctorId: a.doctorId,
        officeId: offices[newProposedAppts[idx].getDay()],
        userId: a.userId,
        extraAppt: newProposedAppts[idx].getUTCHours() === 0 ? newProposedAppts[idx] : null,
        status: APPOINTMENT_STATUS.TO_CONFIRM,
      }, {transaction});
      updateMsgs.push({
        doctorId: a.doctorId,
        userId: a.userId,
        proposedTime: newProposedAppts[idx],
        oldTime: a.arrivalTime,
      });
    }));
    await transaction.commit();
    rmq.sendMessage(queueConstants.DAY_CANCEL_BY_DOCTOR, updateMsgs);
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

async function userConfirmAppointment(apptId) {
  const transaction = await sequelize.transaction();
  try {
    if (!apptId) {
      throw new Error('Appointment ID is required');
    }

    const updatedAppt = await Appointment.update({
      status: APPOINTMENT_STATUS.CONFIRMED,
    }, {
      where: { id: apptId },
      transaction
    });
    await transaction.commit();
    return updatedAppt;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

async function getHistoryBetween({ doctorId, userId }) {
  const transaction = await sequelize.transaction();
  try {
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
      transaction,
    });
    await transaction.commit();
    return appointments;

  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

async function upsertNotes(apptId, payload) {
  const transaction = await sequelize.transaction();
  try {
    if (!apptId) {
      throw new Error('Appointment ID is required');
    }

    if (!payload.text) {
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
      transaction
    );
    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

async function markAssisted(apptId) {
  const transaction = await sequelize.transaction();
  try {
    if (!apptId) {
      throw new Error('Appointment ID is required');
    }

    await Appointment.update(
      {
        assisted: true,
      },
      {
        where: {
          id: apptId,
        },
        transaction
      },
    );
    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

async function exportPDF(doctorId, userId) {
  const transaction = await sequelize.transaction();
  try {
    const appts = await Appointment.findAll({
      where: { doctorId, userId, status: 'confirmed' },
      include: [{ model: Doctor }, { model: User }],
      transaction,
    });
    await transaction.commit();

    const fileName = await pdfGenerator.generatePDF(appts);
    return fileName;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}
