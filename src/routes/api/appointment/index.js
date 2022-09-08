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

module.exports = router;

function getAppointmentById(req, res) {
  const apptId = _.get(req, 'params.id');

  return apptController.getAppointmentById(apptId)
    .then((data) => res.status(200).send({ data }))
    .catch((error) => {
      logger.error(error.message);
      res.status(500).send({ message: error.message });
    });
}

async function getAppointmentsByUserId(req, res) {
  const userId = req.currentUser.id;

  return apptController.getAppointmentsByUserId(userId)
    .then((data) => res.status(200).send({ data }))
    .catch((error) => {
      logger.error(error.message);
      res.status(500).send({ message: error.message });
    });
}

function updateAppointment(req, res) {
  const apptId = _.get(req, 'params.id');
  const {
    arrivalTime,
    doctorId,
    officeId,
    status,
  } = req.body;

  // TODO: Add something to check if is doctor
  // const isDoctor = _.get(req, 'currentUser.isDoctor', false)
  const isDoctor = false;

  if (!apptId) {
    return res.status(422).send({ message: 'You are missing required fields.' });
  }

  return apptController.updateAppointment(apptId, isDoctor, {
    arrivalTime,
    doctorId,
    officeId,
    status,
  })
    .then(() => res.status(200).send())
    .catch((error) => {
      logger.error(error.message);
      res.status(500).send({ message: error.message });
    });
}

function createAppointment(req, res) {
  const userId = req.currentUser.id;
  const {
    arrivalTime, doctorId, officeId,
  } = req.body;

  if (!arrivalTime || !doctorId || !officeId || !userId) {
    return res.status(422).send({ message: 'You are missing required fields.' });
  }

  return apptController.createAppointment({
    arrivalTime,
    doctorId,
    officeId,
    userId,
  })
    .then((data) => res.status(201).send({ data }))
    .catch((error) => {
      logger.error(error.message);
      res.status(500).send({ message: error.message });
    });
}

function getAllAppointments(req, res) {
  return apptController.getAllAppointments()
    .then((data) => res.status(200).send({ data }))
    .catch((error) => {
      logger.error(error.message);
      res.status(500).send({ message: error.message });
    });
}
