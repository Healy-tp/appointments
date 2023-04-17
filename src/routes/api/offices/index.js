const router = require('express').Router();

const { currentUser } = require('@healy-tp/common');
const logger = require('../../../logger');
const officeController = require('../../../controllers/office');

router.get('/', currentUser, getAllOffices);

module.exports = router;

async function getAllOffices(req, res, next) {
  try {
    const response = await officeController.getAllOffices();
    res.status(200).send(response);
  } catch (err) {
    logger.error(err.message);
    next(err);
  }
}
