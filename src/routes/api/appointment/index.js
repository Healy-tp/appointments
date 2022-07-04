const router = require('express').Router();
const _ = require('lodash');

const logger = require('../../../logger');
const apptController = require('../../../controllers/appointment');

/* ****** route definitions ****** */

router.get('/:id', getAppointmentById);
// router.post('/', createAppointment);

module.exports = router;

async function getAppointmentById(req, res) {
  const apptId = _.get(req, 'params.id');
  return apptController.getAppointmentById(apptId)
    .then((appt) => {
      if (!appt) {
        res.status(500).send({ message: `Appointment ${apptId} not found.` });
      }
      res.status(200).send({ appt });
    })
    .catch((error) => {
      logger.error(error.message);
      res.status(500).send({ message: error.message });
    });
}
