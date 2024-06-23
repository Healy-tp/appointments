/* eslint-disable global-require */
/* eslint-disable no-unused-expressions */

const sinon = require('sinon');
const chai = require('chai');

const { expect } = chai;

const { SPECIALTIES } = require('@healy-tp/common');

const { Office } = require('../../src/db/models/office');
const outputMockData = require('./mockData/office');

const { OFFICE_NUMBER, OFFICE_ID } = require('./constants');

describe('controllers/availability', () => {
  let modelStub;
  let officeController;

  before(() => {
    // import file to test
    officeController = require('../../src/controllers/office');
  });

  afterEach(() => {
    modelStub.restore();
  });

  describe('getAllOffices', () => {
    it('should return all records', async () => {
      const mockedRecords = outputMockData.getAllOffices();
      modelStub = sinon.stub(Office, 'findAll').returns(mockedRecords);

      const records = await officeController.getAllOffices();
      expect(modelStub.calledOnce).to.be.true;
      expect(records).to.equal(mockedRecords);
      expect(records).to.have.lengthOf(1);
    });
  });

  describe('editOffice', () => {
    it('should throw an error when no id number is provided', async () => {
      await officeController.editOffice({})
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql('Cannot edit an office without a valid id');
        });
    });

    it('should throw an error when no office number is provided', async () => {
      await officeController.editOffice({
        id: OFFICE_ID,
      })
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql('Cannot edit an office without a valid office number or specialties');
        });
    });

    it('should throw an error when no specialties are provided', async () => {
      await officeController.editOffice({
        id: OFFICE_ID,
        number: OFFICE_NUMBER,
      })
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql('Cannot edit an office without a valid office number or specialties');
        });
    });

    it('should throw an error when specialties provided are empty', async () => {
      await officeController.editOffice({
        id: OFFICE_ID,
        number: OFFICE_NUMBER,
        specialties: [],
      })
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql('Cannot edit an office without a valid office number or specialties');
        });
    });

    it('should throw an error when specialties provided are invalid', async () => {
      await officeController.editOffice({
        id: OFFICE_ID,
        number: OFFICE_NUMBER,
        specialties: ['Wrong-invalid-specialty'],
      })
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql('Cannot edit an office with invalid specialties');
        });
    });

    it('should throw an error when there is an existent office with that number', async () => {
      const findOneStub = sinon.stub(Office, 'findOne').returns(outputMockData.fakeOffice);

      await officeController.editOffice({
        id: OFFICE_ID,
        number: OFFICE_NUMBER,
        specialties: [SPECIALTIES.CARDIOLOGY],
      })
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql(`An Office with number ${OFFICE_NUMBER} already exists.`);
        })
        .finally(() => {
          findOneStub.restore();
        });
    });

    it('should edit an office correctly', async () => {
      const updateResponse = 'Office edited successfully';
      const findOneStub = sinon.stub(Office, 'findOne').returns(null);
      const updateStub = sinon.stub(Office, 'update').returns(updateResponse);

      await officeController.editOffice({
        id: OFFICE_ID,
        number: OFFICE_NUMBER,
        specialties: [SPECIALTIES.CARDIOLOGY],
      })
        .then((response) => {
          expect(findOneStub.calledOnce).to.be.true;
          expect(updateStub.calledOnce).to.be.true;
          expect(response).to.eql(updateResponse);
        })
        .finally(() => {
          findOneStub.restore();
          updateStub.restore();
        });
    });
  });

  describe('createOffice', () => {
    it('should throw an error when no office number is provided', async () => {
      await officeController.createOffice({})
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql('Cannot create an office without a valid office number or specialties');
        });
    });

    it('should throw an error when no specialties are provided', async () => {
      await officeController.createOffice({
        officeNumber: OFFICE_NUMBER,
      })
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql('Cannot create an office without a valid office number or specialties');
        });
    });

    it('should throw an error when specialties provided are empty', async () => {
      await officeController.createOffice({
        officeNumber: OFFICE_NUMBER,
        specialties: [],
      })
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql('Cannot create an office without a valid office number or specialties');
        });
    });

    it('should throw an error when specialties provided are invalid', async () => {
      await officeController.createOffice({
        officeNumber: OFFICE_NUMBER,
        specialties: ['Wrong-invalid-specialty'],
      })
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql('Cannot create an office with invalid specialties');
        });
    });

    it('should throw an error when there is an existent office with that number', async () => {
      const findOneStub = sinon.stub(Office, 'findOne').returns(outputMockData.fakeOffice);

      await officeController.createOffice({
        officeNumber: OFFICE_NUMBER,
        specialties: [SPECIALTIES.CARDIOLOGY],
      })
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql('Office number already exists. Please try another one.');
        })
        .finally(() => {
          findOneStub.restore();
        });
    });

    it('should create an office correctly', async () => {
      const findOneStub = sinon.stub(Office, 'findOne').returns(null);
      const createStub = sinon.stub(Office, 'create').returns(outputMockData.fakeOffice);

      await officeController.createOffice({
        officeNumber: OFFICE_NUMBER,
        specialties: [SPECIALTIES.CARDIOLOGY],
      })
        .then((office) => {
          expect(findOneStub.calledOnce).to.be.true;
          expect(createStub.calledOnce).to.be.true;

          expect(office).to.have.property('id').that.is.a('number');
          expect(office).to.have.property('specialties').that.is.an('array').to.eql([SPECIALTIES.CARDIOLOGY]);
          expect(office).to.have.property('number').that.is.a('number').to.eql(OFFICE_NUMBER);
        })
        .finally(() => {
          findOneStub.restore();
          createStub.restore();
        });
    });
  });
});
