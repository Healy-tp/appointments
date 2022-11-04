const router = require('express').Router();

const { currentUser, hasPermissions } = require('@healy-tp/common');
const logger = require('../../../logger');
const officeController = require('../../../controllers/office');
const { RolesPermissions } = require('../../../db/models/rolesPermissions');

router.get('/', [currentUser, hasPermissions('GET_OFFICES', RolesPermissions)], getAllOffices);

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
