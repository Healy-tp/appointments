const router = require('express').Router();

const { currentUser, isAdmin } = require('@healy-tp/common');
const logger = require('../../../logger');
const apptController = require('../../../controllers/appointment');
const availabilityController = require('../../../controllers/availability');
const officeController = require('../../../controllers/office');

router.get('/availabilities', [currentUser, isAdmin], getAllAvailabilities);
router.get('/offices', [currentUser, isAdmin], getAllOffices);
router.get('/appointments', [currentUser, isAdmin], getAllAppointments);

router.post('/appointments/create-for-user', [currentUser, isAdmin], createAppointmentForUser);
router.post('/offices/create', [currentUser, isAdmin], createOffice);

router.put('/offices/edit', [currentUser, isAdmin], editOffice);
router.put('/availabilities/edit', [currentUser, isAdmin], editAvailability);
router.put('/appointment/edit', [currentUser, isAdmin], editAppointment);

module.exports = router;

async function getAllAvailabilities(req, res, next) {
  try {
    const response = await availabilityController.getAllRecords();
    res.status(200).send(response);
  } catch (err) {
    logger.error(err.message);
    next(err);
  }
}

async function getAllOffices(req, res, next) {
  try {
    const response = await officeController.getAllOffices();
    res.status(200).send(response);
  } catch (err) {
    logger.error(err.message);
    next(err);
  }
}

async function getAllAppointments(req, res, next) {
  try {
    const response = await apptController.getAllAppointments(true);
    res.status(200).send(response);
  } catch (err) {
    logger.error(err.message);
    next(err);
  }
}

async function createAppointmentForUser(req, res, next) {
  try {
    const response = await apptController.createAppointment(req.body, true);
    res.status(200).send(response);
  } catch (err) {
    logger.error(err.message);
    next(err);
  }
}

async function createOffice(req, res, next) {
  try {
    const response = await officeController.createOffice(req.body);
    res.status(200).send(response);
  } catch (err) {
    logger.error(err.message);
    next(err);
  }
}

async function editOffice(req, res, next) {
  try {
    const response = await officeController.editOffice(req.body);
    res.status(200).send(response);
  } catch (err) {
    logger.error(err.message);
    next(err);
  }
}

async function editAvailability(req, res, next) {
  try {
    const response = await availabilityController.editAvailability(req.body);
    res.status(200).send(response);
  } catch (err) {
    logger.error(err.message);
    next(err);
  }
}

async function editAppointment(req, res, next) {
  try {
    const response = await apptController.editAppointment(req.body);
    res.status(200).send(response);
  } catch (err) {
    logger.error(err.message);
    next(err);
  }
}
