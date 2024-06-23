const router = require('express').Router();
const _ = require('lodash');

const { currentUser, isAdmin } = require('@healy-tp/common');
const logger = require('../../../utils/logger');
const apptController = require('../../../controllers/appointment');
const availabilityController = require('../../../controllers/availability');
const officeController = require('../../../controllers/office');
const { Doctor } = require('../../../db/models/doctor');

router.get('/availabilities', [currentUser], getAllAvailabilities);
router.get('/offices', [currentUser], getAllOffices);
router.get('/appointments', [currentUser], getAllAppointments);

router.post('/appointments/create-for-user', [currentUser], createAppointmentForUser);
router.post('/offices/create', [currentUser], createOffice);

router.put('/offices/edit', [currentUser], editOffice);
router.put('/availabilities/edit', [currentUser], editAvailability);
router.put('/appointment/edit', [currentUser], editAppointment);

router.delete('/doctors/delete/:id', [currentUser], deleteDoctor);

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

async function deleteDoctor(req, res, next) {
  const doctorId = _.get(req, 'params.id');
  try {
    Doctor.destroy({
      where: {
        id: doctorId,
      },
    });
  } catch (err) {
    logger.error(err.message);
    next(err);
  }
}
