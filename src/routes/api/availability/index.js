/* eslint-disable consistent-return */
const router = require('express').Router();

const { currentUser, hasPermissions } = require('@healy-tp/common');
const logger = require('../../../logger');
const availabilityController = require('../../../controllers/availability');
const { RolesPermissions } = require('../../../db/models/rolesPermissions');

/* ****** route definitions ****** */

// Add isAdmin middleware check to createAvailability
router.post('/', [currentUser, hasPermissions('CREATE_AVAILABILITY', RolesPermissions)], createAvailability);
router.get('/all', getAllRecords);
router.get('/', [currentUser, hasPermissions('GET_AVAILABILITY_BY_DOC_ID', RolesPermissions)], getAvailabilityByDoctorId);

module.exports = router;

async function createAvailability(req, res, next) {
  try {
  // Probably userId will be retrieved from currentUser or another middleware
    const doctorId = req.currentUser.id;
    const {
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

    const response = await availabilityController.createAvailability({
      doctorId,
      officeId,
      weekday,
      startHour,
      endHour,
      frequency,
      validUntil,
    });
    res.status(200).send(response);
  } catch (err) {
    logger.error(err.message);
    next(err);
  }
}

async function getAvailabilityByDoctorId(req, res, next) {
  try {
    // const doctorId = _.get(req, 'params.doctorId');
    const doctorId = req.currentUser.id;
    const response = await availabilityController.getByDoctorId(doctorId);
    res.status(200).send(response);
  } catch (err) {
    logger.error(err.message);
    next(err);
  }
}

async function getAllRecords(req, res, next) {
  try {
    const response = await availabilityController.getAllRecords();
    res.status(200).send(response);
  } catch (err) {
    logger.error(err.message);
    next(err);
  }
}
