const router = require('express').Router();
const _ = require('lodash');
const { currentUser } = require('@healy-tp/common');

const logger = require('../../../logger');
const apptController = require('../../../controllers/appointment');

/* ****** route definitions ****** */
// TODO: Improve error handling

router.get('/all', getAllAppointments);
router.get('/', currentUser, getAppointmentsByUserId);
router.get('/history-with-user/:id', currentUser, getHistory);
router.get('/mark-assisted/:id', markApptAssisted);

router.put('/:id', currentUser, updateAppointment);

router.delete('/:id', currentUser, deleteAppointment);

router.post('/', currentUser, createAppointment);
router.post('/:id/start-chat', currentUser, startChat);
router.post('/:id/upsert-notes', currentUser, upsertNotes);
router.post('/:id/doctor-cancelation', currentUser, doctorAppointmentCancelation);
router.post('/:id/confirm-appt', userConfirmAppointment);
router.post('/doctor-day-cancelation', currentUser, doctorDayCancelation);

module.exports = router;

async function getAppointmentsByUserId(req, res, next) {
  try {
    const userId = req.currentUser.id;
    const response = await apptController.getAppointmentsByUserId(userId, req.query.isDoctor === 'true');
    res.status(200).send(response);
  } catch (err) {
    logger.error(err.message);
    next(err);
  }
}

async function updateAppointment(req, res, next) {
  try {
    const apptId = _.get(req, 'params.id');
    const { arrivalTime, doctorId, officeId } = req.body;

    if (!apptId) {
      return res.status(422).send({ message: 'You are missing required fields.' });
    }

    const response = await apptController.userUpdateAppointment(apptId, {
      arrivalTime,
      doctorId,
      officeId,
    }, req.currentUser.id);
    if (!response) {
      res.status(403).send();
    }

    res.status(200).send(response);
  } catch (err) {
    logger.error(err.message);
    next(err);
  }
}

async function createAppointment(req, res, next) {
  try {
    const userId = req.currentUser.id;
    const {
      arrivalTime, doctorId, officeId,
    } = req.body;

    if (!arrivalTime || !doctorId || !officeId || !userId) {
      return res.status(422).send({ message: 'You are missing required fields.' });
    }

    const response = await apptController.createAppointment({
      arrivalTime,
      doctorId,
      officeId,
      userId,
    }, false);
    res.status(200).send(response);
  } catch (err) {
    logger.error(err.message);
    next(err);
  }
}

async function deleteAppointment(req, res, next) {
  try {
    const apptId = _.get(req, 'params.id');
    const response = await apptController.deleteAppointment(apptId, req.currentUser.id);
    if (!response) res.status(403).send();
    res.status(200).send(response);
  } catch (err) {
    logger.error(err.message);
    next(err);
  }
}

async function getAllAppointments(req, res, next) {
  try {
    const response = await apptController.getAllAppointments();
    res.status(200).send(response);
  } catch (err) {
    logger.error(err.message);
    next(err);
  }
}

async function startChat(req, res, next) {
  try {
    const apptId = _.get(req, 'params.id');
    const response = await apptController.startChat(apptId);
    res.status(200).send(response);
  } catch (err) {
    logger.error(err.message);
    next(err);
  }
}

async function doctorAppointmentCancelation(req, res, next) {
  try {
    const apptId = _.get(req, 'params.id');
    const response = await apptController.doctorAppointmentCancelation(apptId);
    res.status(200).send(response);
  } catch (err) {
    logger.error(err.message);
    next(err);
  }
}

async function doctorDayCancelation(req, res, next) {
  try {
    const { day } = req.body;
    const response = await apptController.doctorDayCancelation(4, day);
    res.status(200).send(response);
  } catch (err) {
    logger.error(err.message);
    next(err);
  }
}


// TODO: CHECK IF ADD CURRENT USER MDDWARE
async function userConfirmAppointment(req, res, next) {
  try {
    const apptId = _.get(req, 'params.id');
    const response = await apptController.userConfirmAppointment(apptId);
    res.status(200).send(response);
  } catch (err) {
    logger.error(err.message);
    next(err);
  }
}

async function getHistory(req, res, next) {
  try {
    const requestorId = req.currentUser.id;
    const counterpartId = _.get(req, 'params.id');
    const params = {
      doctorId: req.currentUser.roleId === 2 ? requestorId : counterpartId,
      userId: req.currentUser.roleId === 2 ? counterpartId : requestorId,
    };
    const response = await apptController.getHistoryBetween(params);
    res.status(200).send(response);
  } catch (err) {
    logger.error(err.message);
    next(err);
  }
}

async function upsertNotes(req, res, next) {
  try {
    const apptId = _.get(req, 'params.id');
    const response = await apptController.upsertNotes(apptId, req.body);
    res.status(200).send(response);
  } catch (err) {
    logger.error(err.message);
    next(err);
  }
}

async function markApptAssisted(req, res, next) {
  try {
    const apptId = _.get(req, 'params.id');
    const response = await apptController.markApptAssisted(apptId);
    res.status(200).send(response);
  } catch (err) {
    logger.error(err.message);
    next(err);
  }
}
