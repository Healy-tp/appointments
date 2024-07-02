const crypto = require('crypto');
const { Op } = require('sequelize');
const _ = require('lodash');

const { getSpecialties } = require('@healy-tp/common');
const { Office } = require('../db/models/office');
const { sequelize } = require('../db/dbsetup');

const self = {
  createOffice,
  editOffice,
  getAllOffices,
};

module.exports = self;

async function getAllOffices() {
  const transaction = await sequelize.transaction();
  try {
    const offices = await Office.findAll({transaction});
    await transaction.commit();
    return offices;

  } catch (err) {
    await transaction.rollback();
    throw err;
  }
  
}

async function createOffice({
  specialties,
  officeNumber,
}) {
  const transaction = await sequelize.transaction();
  try {
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
      transaction,
      raw: true,
    });

    if (existingOffice) {
      throw new Error('Office number already exists. Please try another one.');
    }

    const newOffice = Office.create({
      id: crypto.randomUUID(),
      number: officeNumber,
      specialties,
    }, { transaction });
    await transaction.commit();
    return newOffice;
  } catch (err) {
    await transaction.commit();
    throw err;
  }
}

async function editOffice({
  id,
  number,
  specialties,
}) {
  const transaction = await sequelize.transaction();
  try {
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
      transaction,
      raw: true,
    });

    if (existingOffice) {
      throw new Error(`An Office with number ${number} already exists.`);
    }

    const filters = { where: { id }, transaction };
    const updatedOffice = Office.update({
      number,
      specialties,
    }, filters);
    await transaction.commit();
    return updatedOffice;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}
