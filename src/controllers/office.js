const { Office } = require('../db/models/office');

const self = {
  getAllOffices,
};

module.exports = self;

async function getAllOffices() {
  const response = await Office.findAll();
  return response;
}
