/* eslint-disable no-unused-expressions */
/* eslint-disable global-require */
const sinon = require('sinon');
const chai = require('chai');
const moment = require('moment');

const { expect } = chai;

const pdfGenerator = require('../../src/services/pdf-generator');


describe('services/pdf-generator', () => {
  describe('generatePDF', () => {
    it('generates a PDF successfully', async () => {
      const appt = {
        User: {
          firstName: 'test',
          lastName: 'user'
        },
        Doctor: {
          firstName: 'test',
          lastName: 'doctor'
        },
        arrivalTime: moment().add(1, 'day').toJSON(),
        notes: 'test notes to write'
      }

      const saveFileStub = sinon.stub(pdfGenerator, 'saveFile').returns('test-file-name');
      const response = await pdfGenerator.generatePDF([appt]);

      expect(response).to.be.eql('test-file-name');
      expect(saveFileStub.calledOnce).to.be.true;
    });
  });
});
