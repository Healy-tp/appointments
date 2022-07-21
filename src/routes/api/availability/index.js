const router = require('express').Router();

const logger = require('../../../logger');
const availabilityController = require('../../../controllers/availability');

/* ****** route definitions ****** */

// Add isAdmin middleware check
router.post('/', createAvailability);

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
