const config = require('../../config');
const apptController = require('../../controllers/appointment');
const { sendMessage } = require('../rabbitmq/sender');
const queueConstants = require('../rabbitmq/constants');

async function checkAppointmentsForReminders() {
  if (config.NODE_ENV !== 'development') {
    const appointments24Hs = await apptController.getAppointmentsInInterval(5);
    sendMessage(queueConstants.REMINDER_24_HS_EVENT, appointments24Hs);
    // const appointments48Hs = await apptController.getAppointmentsInInterval(2);
    // sendMessage(queueConstants.REMINDER_48_HS_EVENT, appointments48Hs);
  }
}

module.exports = {
  checkAppointmentsForReminders,
};
