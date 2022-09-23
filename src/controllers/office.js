const _ = require('lodash');
const { Office } = require('../db/models/office');

const self = {
  createOffice,
  getAllOffices,
};

module.exports = self;

async function getAllOffices() {
  const response = await Office.findAll();
  return response;
}

async function createOffice({
  specialties,
  officeNumber,
}) {
  if (!officeNumber || !specialties || _.isEmpty(specialties)) {
    throw new Error('Cannot create an office without a valid office number or specialties');
  }

  const existingOffice = await Office.findOne({
    where: {
      number: officeNumber,
    },
    raw: true,
  });

  if (existingOffice) {
    throw new Error('Office number already exists. Please try another one.');
  }

  return Office.create({
    number: officeNumber,
    specialties,
  });
}
