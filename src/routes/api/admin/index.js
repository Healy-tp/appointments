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

async function getAllAvailabilities(req, res, next) {
  try {
    if (req.currentUser?.roleId !== 3) {
      throw new Error(); // TODO: Move this to common lib
    }
    const response = await availabilityController.getAllRecords();
    res.status(200).send(response);
  } catch (err) {
    logger.error(err.message);
    next(err);
  }
}

async function getAllOffices(req, res, next) {
  try {
    if (req.currentUser?.roleId !== 3) {
      throw new Error(); // TODO: Move this to common lib
    }
    const response = await officeController.getAllOffices();
    res.status(200).send(response);
  } catch (err) {
    logger.error(err.message);
    next(err);
  }
}

async function getAllAppointments(req, res, next) {
  try {
    if (req.currentUser?.roleId !== 3) {
      throw new Error(); // TODO: Move this to common lib
    }
    const response = await apptController.getAllAppointments(true);
    res.status(200).send(response);
  } catch (err) {
    logger.error(err.message);
    next(err);
  }
}

async function createAppointmentForUser(req, res, next) {
  try {
    if (req.currentUser?.roleId !== 3) {
      throw new Error(); // TODO: Move this to common lib
    }
    const response = await apptController.createAppointment(req.body);
    res.status(200).send(response);
  } catch (err) {
    logger.error(err.message);
    next(err);
  }
}

async function createOffice(req, res, next) {
  try {
    if (req.currentUser?.roleId !== 3) {
      throw new Error(); // TODO: Move this to common lib
    }
    const response = await officeController.createOffice(req.body);
    res.status(200).send(response);
  } catch (err) {
    logger.error(err.message);
    next(err);
  }
}

async function editOffice(req, res, next) {
  try {
    if (req.currentUser?.roleId !== 3) {
      throw new Error(); // TODO: Move this to common lib
    }
    const response = await officeController.editOffice(req.body);
    res.status(200).send(response);
  } catch (err) {
    logger.error(err.message);
    next(err);
  }
}
