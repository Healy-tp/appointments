const router = require('express').Router();
// const _ = require('lodash');

const logger = require('../../../logger');
const apptController = require('../../../controllers/appointment');
const availabilityController = require('../../../controllers/availability');
const officeController = require('../../../controllers/office');
// const { RolesPermissions } = require('../../../db/models/rolesPermissions');
const { currentUser } = require('@healy-tp/common');

router.get('/availabilities', [currentUser], getAllAvailabilities);
router.get('/offices', [currentUser], getAllOffices);
router.get('/appointments', [currentUser], getAllAppointments);
router.post('/appointments/create-for-user', [currentUser], createAppointmentForUser);

module.exports = router;

function getAllAvailabilities(req, res) {
  if (req.currentUser.roleId !== 3) {
    throw new Error(); // TODO: Move this to common lib
  }

  return availabilityController.getAllRecords()
    .then((data) => res.status(200).send({ data }))
    .catch((error) => {
      logger.error(error.message);
      res.status(500).send({ message: error.message });
    });
}

function getAllOffices(req, res) {
  if (req.currentUser.roleId !== 3) {
    throw new Error(); // TODO: Move this to common lib
  }

  return officeController.getAllOffices()
    .then((data) => res.status(200).send({ data }))
    .catch((error) => {
      logger.error(error.message);
      res.status(500).send({ message: error.message });
    });
}

function getAllAppointments(req, res) {
  if (req.currentUser.roleId !== 3) {
    throw new Error(); // TODO: Move this to common lib
  }

  return apptController.getAllAppointments(true)
    .then((data) => res.status(200).send({ data }))
    .catch((error) => {
      logger.error(error.message);
      res.status(500).send({ message: error.message });
    });
}

function createAppointmentForUser(req, res) {
  if (req.currentUser.roleId !== 3) {
    throw new Error(); // TODO: Move this to common lib
  }

  return apptController.createAppointment(req.body)
    .then((data) => res.status(200).send({ data }))
    .catch((error) => {
      logger.error(error.message);
      res.status(500).send({ message: error.message });
    });
}
