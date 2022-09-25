const router = require('express').Router();

const { currentUser } = require('@healy-tp/common');
const logger = require('../../../logger');
const apptController = require('../../../controllers/appointment');
const availabilityController = require('../../../controllers/availability');
const officeController = require('../../../controllers/office');

router.get('/availabilities', [currentUser], getAllAvailabilities);
router.get('/offices', [currentUser], getAllOffices);
router.get('/appointments', [currentUser], getAllAppointments);
router.post('/appointments/create-for-user', [currentUser], createAppointmentForUser);
router.post('/offices/create', [currentUser], createOffice);
router.put('/offices/edit', [currentUser], editOffice);

module.exports = router;

function getAllAvailabilities(req, res) {
  if (req.currentUser?.roleId !== 3) {
    throw new Error(); // TODO: Move this to common lib
  }

  return availabilityController.getAllRecords()
    .then((data) => res.status(200).send({ data }))
    .catch((error) => {
      logger.error(error.message);
      return res.status(500).send({ message: error.message });
    });
}

function getAllOffices(req, res) {
  if (req.currentUser?.roleId !== 3) {
    throw new Error(); // TODO: Move this to common lib
  }

  return officeController.getAllOffices()
    .then((data) => res.status(200).send({ data }))
    .catch((error) => {
      logger.error(error.message);
      return res.status(500).send({ message: error.message });
    });
}

function getAllAppointments(req, res) {
  if (req.currentUser?.roleId !== 3) {
    throw new Error(); // TODO: Move this to common lib
  }

  return apptController.getAllAppointments(true)
    .then((data) => res.status(200).send({ data }))
    .catch((error) => {
      logger.error(error.message);
      return res.status(500).send({ message: error.message });
    });
}

function createAppointmentForUser(req, res) {
  if (req.currentUser?.roleId !== 3) {
    throw new Error(); // TODO: Move this to common lib
  }

  return apptController.createAppointment(req.body)
    .then((data) => res.status(201).send({ data }))
    .catch((error) => {
      logger.error(error.message);
      return res.status(500).send({ message: error.message });
    });
}

function createOffice(req, res) {
  if (req.currentUser?.roleId !== 3) {
    throw new Error(); // TODO: Move this to common lib
  }
  return officeController.createOffice(req.body)
    .then((data) => res.status(201).send({ data }))
    .catch((error) => {
      logger.error(error.message);
      return res.status(500).send({ message: error.message });
    });
}

function editOffice(req, res) {
  if (req.currentUser?.roleId !== 3) {
    throw new Error(); // TODO: Move this to common lib
  }
  return officeController.editOffice(req.body)
    .then((data) => res.status(200).send({ data }))
    .catch((error) => {
      logger.error(error.message);
      return res.status(500).send({ message: error.message });
    });
}
