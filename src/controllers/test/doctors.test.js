/* eslint-disable global-require */
/* eslint-disable no-unused-expressions */

const sinon = require('sinon');
const chai = require('chai');

const { expect } = chai;

const { Doctor } = require('../../db/models/doctor');
const outputMockData = require('../mockData/doctors');

describe('controllers/doctors', () => {
  let modelStub;
  let doctorController;

  before(() => {
    // import file to test
    doctorController = require('../doctors');
  });

  afterEach(() => {
    modelStub.restore();
  });

  describe('getDoctors', () => {
    it('should return an empty array when there are no records', async () => {
      modelStub = sinon.stub(Doctor, 'findAll').returns([]);

      const records = await doctorController.getDoctors();
      expect(modelStub.calledOnce).to.be.true;
      expect(records).to.be.an('array').that.is.empty;
    });

    it('should return all records', async () => {
      const mockedRecords = outputMockData.getDoctors();
      modelStub = sinon.stub(Doctor, 'findAll').returns(mockedRecords);

      const records = await doctorController.getDoctors();
      expect(modelStub.calledOnce).to.be.true;
      expect(records).to.equal(mockedRecords);
      expect(records).to.have.lengthOf(1);
    });
  });
});
