const router = require('express').Router();
const doctorsController = require('../../../controllers/doctors');
const logger = require('../../../logger');

router.get('/', getDoctors);

module.exports = router;

function getDoctors(req, res) {
  return doctorsController.getDoctors()
    .then((data) => res.status(200).send({ data }))
    .catch((error) => {
      logger.error(error.message);
      res.status(500).send({ message: error.message });
    });
}
