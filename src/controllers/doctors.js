const { Doctor } = require('../db/models/doctor');

const self = {
  getDoctors,
};

module.exports = self;

async function getDoctors() {
  return Doctor.findAll();
}
