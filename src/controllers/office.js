const _ = require('lodash');
const { Op } = require('sequelize');
const { getSpecialties } = require('@healy-tp/common');
const { Office } = require('../db/models/office');

const self = {
  createOffice,
  editOffice,
  getAllOffices,
};

module.exports = self;

async function getAllOffices() {
  return Office.findAll();
}

async function createOffice({
  specialties,
  officeNumber,
}) {
  if (!officeNumber || !specialties || _.isEmpty(specialties)) {
    throw new Error('Cannot create an office without a valid office number or specialties');
  }

  if (!_.every(specialties, (sp) => _.includes(getSpecialties(), sp))) {
    throw new Error('Cannot create an office with invalid specialties');
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

async function editOffice({
  id,
  number,
  specialties,
}) {
  if (!id) {
    throw new Error('Cannot edit an office without a valid id');
  }

  if (!number || !specialties || _.isEmpty(specialties)) {
    throw new Error('Cannot edit an office without a valid office number or specialties');
  }

  if (!_.every(specialties, (sp) => _.includes(getSpecialties(), sp))) {
    throw new Error('Cannot edit an office with invalid specialties');
  }

  const existingOffice = await Office.findOne({
    where: {
      number,
      id: {
        [Op.ne]: id,
      },
    },
    raw: true,
  });

  if (existingOffice) {
    throw new Error(`An Office with number ${number} already exists.`);
  }

  const filters = { where: { id } };
  return Office.update({
    number,
    specialties,
  }, filters);
}
