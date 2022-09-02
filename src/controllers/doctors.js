const { Doctor } = require('../db/models/doctor');

const self = {
  getDoctors,
};

module.exports = self;

async function getDoctors() {
  const response = await Doctor.findAll();
  return response;
}
