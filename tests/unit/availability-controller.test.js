/* eslint-disable no-unused-expressions */
/* eslint-disable global-require */

const sinon = require('sinon');
const chai = require('chai');
const moment = require('moment');

const { expect } = chai;

const { Availability } = require('../../src/db/models/availability');
const outputMockData = require('./mockData/availability');

const {
  DOCTOR_IDS, DOCTOR_ID, AVAILABILITY_ID, VALID_UNTIL_DATE, OFFICE_ID,
} = require('./constants');
const { FREQUENCIES, WEEKDAYS } = require('../../src/utils/constants');

describe('controllers/availability', () => {
  let modelStub;
  let availabilityController;

  before(() => {
    // import file to test
    availabilityController = require('../../src/controllers/availability');
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
        })
        .finally(() => {
          findOneStub.restore();
          updateStub.restore();
        });
    });
  });

  describe('createAvailability', () => {
    it('should throw an error when weekday is bigger than saturday', async () => {
      const input = {
        weekday: WEEKDAYS.SATURDAY + 1,
      };
      await availabilityController.createAvailability(input)
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql(`Weekday "${WEEKDAYS.SATURDAY + 1}" is invalid`);
        });
    });

    it('should throw an error when weekday is lower than monday', async () => {
      const input = {
        weekday: WEEKDAYS.MONDAY - 1,
      };
      await availabilityController.createAvailability(input)
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql(`Weekday "${WEEKDAYS.MONDAY - 1}" is invalid`);
        });
    });

    it('should throw an error when frequency does not belong to the list of freqs', async () => {
      const input = {
        weekday: WEEKDAYS.MONDAY,
        frequency: 45,
      };
      await availabilityController.createAvailability(input)
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql(`Frequency "${45} mins." is not valid`);
        });
    });

    it('should throw an error when availability date is already expired (invalid)', async () => {
      const input = {
        weekday: WEEKDAYS.MONDAY,
        frequency: FREQUENCIES[0],
        validUntil: moment().subtract(1, 'days'),
      };
      await availabilityController.createAvailability(input)
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql('Selected availability date is already expired');
        });
    });

    it('should throw an error when the office is occupied for the selected hour', async () => {
      const input = {
        doctorId: DOCTOR_ID,
        officeId: OFFICE_ID,
        weekday: WEEKDAYS.MONDAY,
        frequency: FREQUENCIES[0],
        startHour: 11,
        endHour: 14,
        validUntil: moment().add(1, 'days'),
      };

      const mockedRecords = outputMockData.createAvailability();
      const findAllStub = sinon.stub(Availability, 'findAll').returns([mockedRecords]);

      await availabilityController.createAvailability(input)
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(findAllStub.calledOnce).to.be.true;
          expect(err.message).to.eql('Office is occupied for that date in the selected hour range');
        })
        .finally(() => {
          findAllStub.restore();
        });
    });

    it('should throw an error when the doctor already has an availability on that day', async () => {
      const input = {
        doctorId: DOCTOR_ID,
        officeId: OFFICE_ID,
        weekday: WEEKDAYS.MONDAY,
        frequency: FREQUENCIES[0],
        startHour: 11,
        endHour: 14,
        validUntil: moment().add(1, 'days'),
      };

      const mockedRecords = outputMockData.createAvailability();
      const availabilitiesInOfficeStub = sinon.stub(Availability, 'findAll').returns([]);
      const existingAvailabilityStub = sinon.stub(Availability, 'findOne').returns(mockedRecords);

      await availabilityController.createAvailability(input)
        .then(() => {
          expect('this should not have been called').to.be.false;
        })  
        .catch((err) => {
          expect(availabilitiesInOfficeStub.calledOnce).to.be.true;
          expect(existingAvailabilityStub.calledOnce).to.be.true;
          expect(err.message).to.eql(`Doctor ${input.doctorId} already has an availability on day ${input.weekday}`);
        })
        .finally(() => {
          availabilitiesInOfficeStub.restore();
          existingAvailabilityStub.restore();
        });
    });

    it('should create an availability correctly', async () => {
      const input = {
        doctorId: DOCTOR_ID,
        officeId: OFFICE_ID,
        weekday: WEEKDAYS.MONDAY,
        frequency: FREQUENCIES[0],
        startHour: 11,
        endHour: 14,
        validUntil: moment().add(1, 'days'),
      };

      const mockedRecords = outputMockData.createAvailability();
      const availabilitiesInOfficeStub = sinon.stub(Availability, 'findAll').returns([]);
      const existingAvailabilityStub = sinon.stub(Availability, 'findOne').returns(null);
      const createAvailabilityStub = sinon.stub(Availability, 'create').returns(mockedRecords);

      await availabilityController.createAvailability(input)
        .then((availability) => {
          expect(availabilitiesInOfficeStub.calledOnce).to.be.true;
          expect(existingAvailabilityStub.calledOnce).to.be.true;
          expect(createAvailabilityStub.calledOnce).to.be.true;

          expect(availability).to.have.property('id').that.is.a('number');
          expect(availability).to.have.property('doctorId').that.is.a('number');
          expect(availability).to.have.property('officeId').that.is.a('number');
          expect(availability).to.have.property('weekday').that.is.a('number');
          expect(availability).to.have.property('frequency').that.is.a('number');
        })
        .finally(() => {
          availabilitiesInOfficeStub.restore();
          existingAvailabilityStub.restore();
          createAvailabilityStub.restore();
        });
    });
  });
});
