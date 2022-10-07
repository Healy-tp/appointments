const router = require('express').Router();
const _ = require('lodash');
const { currentUser, hasPermissions } = require('@healy-tp/common');

const logger = require('../../../logger');
const apptController = require('../../../controllers/appointment');
const { RolesPermissions } = require('../../../db/models/rolesPermissions');

/* ****** route definitions ****** */
// TODO: Improve error handling

router.get('/all', getAllAppointments);
router.get('/:id', [currentUser, hasPermissions('EDIT_USERS', RolesPermissions)], getAppointmentById);
router.get('/', [currentUser, hasPermissions('EDIT_USERS', RolesPermissions)], getAppointmentsByUserId);
router.put('/:id', [currentUser, hasPermissions('EDIT_USERS', RolesPermissions)], updateAppointment);
router.post('/', [currentUser, hasPermissions('EDIT_USERS', RolesPermissions)], createAppointment);
router.post('/:id/start-chat', [currentUser, hasPermissions('EDIT_USERS', RolesPermissions)], startChat);

module.exports = router;

async function getAppointmentById(req, res, next) {
  try {
    const apptId = _.get(req, 'params.id');
    const response = await apptController.getAppointmentById(apptId);
    res.status(200).send(response);
  } catch (err) {
    logger.error(err.message);
    next(err);
  }
}

async function getAppointmentsByUserId(req, res, next) {
  try {
    const userId = req.currentUser.id;
    const response = await apptController.getAppointmentsByUserId(userId);
    res.status(200).send(response);
  } catch (err) {
    logger.error(err.message);
    next(err);
  }
}

async function updateAppointment(req, res, next) {
  try {
    const apptId = _.get(req, 'params.id');
    const { arrivalTime, doctorId, officeId, status } = req.body;

    // TODO: Add something to check if is doctor
    // const isDoctor = _.get(req, 'currentUser.isDoctor', false)
    const isDoctor = false;

    if (!apptId) {
      return res.status(422).send({ message: 'You are missing required fields.' });
    }

    const response = await apptController.updateAppointment(apptId, isDoctor, {
      arrivalTime,
      doctorId,
      officeId,
      status,
    });
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
    });
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
