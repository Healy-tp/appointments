const router = require('express').Router();
const _ = require('lodash');

const logger = require('../../../logger');
const apptController = require('../../../controllers/appointment');

/* ****** route definitions ****** */
// TODO: Improve error handling

router.get('/:id', getAppointmentById);
router.get('/', getAppointmentsByUserId);
router.put('/:id', updateAppointment);
router.post('/', createAppointment);

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

function getAppointmentsByUserId(req, res) {
  // We should retrieve this userId via currentUser or middleware, not queryParam
  const userId = _.get(req, 'query.userId');

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
  // const isDoctor = _.get(req, 'currentUser.isDoctor', false)r
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
  // Probably userId will be retrieved from currentUser or another middleware
  const {
    arrivalTime, doctorId, officeId, userId,
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
