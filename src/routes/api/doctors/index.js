const router = require('express').Router();
// const cors = require('cors');
const doctorsController = require('../../../controllers/doctors');
const logger = require('../../../utils/logger');

router.get('/', getDoctors);

module.exports = router;

async function getDoctors(req, res, next) {
  try {
    const response = await doctorsController.getDoctors();
    res.status(200).send(response);
  } catch (err) {
    logger.error(err.message);
    next(err);
  }
}
