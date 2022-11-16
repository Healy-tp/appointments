/* eslint-disable no-unused-expressions */
/* eslint-disable global-require */

const sinon = require('sinon');
const chai = require('chai');

const { expect } = chai;

const { Availability } = require('../../db/models/availability');
const outputMockData = require('../mockData/availability');

const { DOCTOR_IDS, DOCTOR_ID, AVAILABILITY_ID, VALID_UNTIL_DATE } = require('./constants');
const { FREQUENCIES } = require('../../utils/constants');

describe('controllers/availability', () => {
  let modelStub;
  let availabilityController;

  before(() => {
    // import file to test
    availabilityController = require('../availability');
  });

  afterEach(() => {
    modelStub.restore();
  });

  describe('getAllRecords', () => {
    it('should return all records', async () => {
      const mockedRecords = outputMockData.getAllRecords();
      modelStub = sinon.stub(Availability, 'findAll').returns(mockedRecords);

      const records = await availabilityController.getAllRecords();
      expect(modelStub.calledOnce).to.be.true;
      expect(records).to.equal(mockedRecords);
      expect(records).to.have.lengthOf(1);
    });
  });

  describe('getByDoctorId', () => {
    it('should throw an error when no doctor ID provided', async () => {
      await availabilityController.getByDoctorId()
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql('Doctor ID is required');
        });
    });

    it('should return an empty list when doctor ID doesnt have an availability', async () => {
      const mockedRecords = outputMockData.getByDoctorId(DOCTOR_IDS[5]);
      modelStub = sinon.stub(Availability, 'findAll').returns(mockedRecords);

      await availabilityController.getByDoctorId(DOCTOR_IDS[5])
        .then((availabilities) => {
          expect(modelStub.calledOnce).to.be.true;
          expect(availabilities).to.equal(mockedRecords);
          expect(availabilities).to.have.lengthOf(0);
        });
    });

    it('should return an empty list when doctor ID doesnt have an availability', async () => {
      const mockedRecords = outputMockData.getByDoctorId(DOCTOR_ID);
      modelStub = sinon.stub(Availability, 'findAll').returns(mockedRecords);

      await availabilityController.getByDoctorId(DOCTOR_ID)
        .then((availabilities) => {
          expect(modelStub.calledOnce).to.be.true;
          expect(availabilities).to.equal(mockedRecords);
          expect(availabilities).to.have.lengthOf(1);
        });
    });
  });

  describe('editAvailability', () => {
    it('should throw an error when no availability id provided', async () => {
      await availabilityController.editAvailability({})
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql('Availability ID is required');
        });
    });

    it('should throw an error when no frequency is provided', async () => {
      await availabilityController.editAvailability({
        id: AVAILABILITY_ID,
      })
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql('Cannot edit an availability without a valid frequency or valid until date');
        });
    });

    it('should throw an error when no validUntil field is provided', async () => {
      await availabilityController.editAvailability({
        id: AVAILABILITY_ID,
        frequency: FREQUENCIES[0],
      })
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql('Cannot edit an availability without a valid frequency or valid until date');
        });
    });

    it('should throw an error when an availability with provided id is not found', async () => {
      modelStub = sinon.stub(Availability, 'findOne').returns(null);

      await availabilityController.editAvailability({
        id: AVAILABILITY_ID,
        frequency: FREQUENCIES[0],
        validUntil: VALID_UNTIL_DATE,
      })
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql(`Availability "${AVAILABILITY_ID}" not found.`);
        });
    });

    it('should edit an availability correctly', async () => {
      const mockedRecords = outputMockData.fakeAvailability;
      const editResponse = 'Availability edited successfully';
      const findOneStub = sinon.stub(Availability, 'findOne').returns(mockedRecords);
      const updateStub = sinon.stub(Availability, 'update').returns(editResponse);

      await availabilityController.editAvailability({
        id: AVAILABILITY_ID,
        frequency: FREQUENCIES[0],
        validUntil: VALID_UNTIL_DATE,
      })
        .then((response) => {
          expect(findOneStub.calledOnce).to.be.true;
          expect(updateStub.calledOnce).to.be.true;
          expect(response).to.eql(editResponse);
        });
    });
  });
});
