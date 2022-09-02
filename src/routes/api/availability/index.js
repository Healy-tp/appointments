const router = require('express').Router();
const _ = require('lodash');

const logger = require('../../../logger');
const availabilityController = require('../../../controllers/availability');

/* ****** route definitions ****** */

// Add isAdmin middleware check to createAvailability
router.post('/', createAvailability);
router.get('/', getAllRecords);
router.get('/:doctorId', getAvailabilityByDoctorId);

module.exports = router;

function createAvailability(req, res) {
  // Probably userId will be retrieved from currentUser or another middleware
  const {
    doctorId,
    officeId,
    weekday,
    startHour,
    endHour,
    frequency,
    validUntil,
  } = req.body;

  if (!doctorId || !officeId || !weekday || !startHour || !endHour || !frequency || !validUntil) {
    return res.status(422).send({ message: 'You are missing required fields.' });
  }

  return availabilityController.createAvailability({
    doctorId,
    officeId,
    weekday,
    startHour,
    endHour,
    frequency,
    validUntil,
  })
    .then((data) => res.status(201).send({ data }))
    .catch((error) => {
      logger.error(error.message);
      res.status(500).send({ message: error.message });
    });
}

function getAvailabilityByDoctorId(req, res) {
  const doctorId = _.get(req, 'params.doctorId');

  return availabilityController.getByDoctorId(doctorId)
    .then((data) => res.status(200).send({ data }))
    .catch((error) => {
      logger.error(error.message);
      res.status(500).send({ message: error.message });
    });
}

function getAllRecords(req, res) {
  return availabilityController.getAllRecords()
    .then((data) => res.status(200).send({ data }))
    .catch((error) => {
      logger.error(error.message);
      res.status(500).send({ message: error.message });
    });
}
