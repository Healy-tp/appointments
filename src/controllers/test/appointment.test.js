/* eslint-disable global-require */
/* eslint-disable no-unused-expressions */

const sinon = require('sinon');
const chai = require('chai');

const { expect } = chai;

const { Appointment } = require('../../db/models/appointment');
const { Availability } = require('../../db/models/availability');
const { Doctor } = require('../../db/models/doctor');
const { User } = require('../../db/models/user');

const outputMockData = require('../mockData/appointment');
const { APPOINTMENT_STATUS } = require('../../utils/constants');

const {
  USER_ID, USER_IDS, APPOINTMENT_ID, DOCTOR_ID,
} = require('./constants');

describe('controllers/appointment', () => {
  let appointmentController;

  before(() => {
    // import file to test
    appointmentController = require('../appointment');
  });

  describe('createAppointment', () => {
    const pastArrivalTime = '2020-01-01T00:00:00.000Z';
    const validArrivalTime = '2023-01-01T00:00:00.000Z';

    it('should throw an error when no arrival time is sent', async () => {
      await appointmentController.createAppointment({})
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql('Missing required fields');
        });
    });

    it('should throw an error when no doctor id is sent', async () => {
      await appointmentController.createAppointment({
        arrivalTime: validArrivalTime,
      })
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql('Missing required fields');
        });
    });

    it('should throw an error when no user id is sent', async () => {
      await appointmentController.createAppointment({
        arrivalTime: validArrivalTime,
        doctorId: DOCTOR_ID,
      })
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql('Missing required fields');
        });
    });

    it('should throw an error when arrival time is at a past time', async () => {
      await appointmentController.createAppointment({
        arrivalTime: pastArrivalTime,
        doctorId: DOCTOR_ID,
        userId: USER_ID,
      })
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql('Cannot create an appointment at a past time');
        });
    });

    it('should throw an error when there is an existing appointment at that time', async () => {
      const appointmentStub = sinon.stub(Appointment, 'findOne').returns(outputMockData.fakeAppointment);

      await appointmentController.createAppointment({
        arrivalTime: validArrivalTime,
        doctorId: DOCTOR_ID,
        userId: USER_ID,
      })
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(appointmentStub.calledOnce).to.be.true;
          expect(err.message).to.eql('Cannot create an appointment at that time!');
        })
        .finally(() => {
          appointmentStub.restore();
        });
    });

    it('should throw an error when there is an existing appointment on different time but same day', async () => {
      const appointmentStub = sinon.stub(Appointment, 'findOne');
      // First call returns null -> existing appt on arrival time provided
      appointmentStub.onCall(0).returns(null);
      // Second call returns an appointment -> same day as another appt
      appointmentStub.onCall(1).returns(outputMockData.fakeAppointment);

      await appointmentController.createAppointment({
        arrivalTime: new Date(),
        doctorId: DOCTOR_ID,
        userId: USER_ID,
      })
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(appointmentStub.calledTwice).to.be.true;
          expect(err.message).to.eql('You already have an appointment for that day');
        })
        .finally(() => {
          appointmentStub.restore();
        });
    });

    it('should throw an error when there are not slots for the doctor selected at that time', async () => {
      const availabilityStub = sinon.stub(Availability, 'getAllSlots').returns([]);
      const appointmentStub = sinon.stub(Appointment, 'findOne');
      appointmentStub.onCall(0).returns(null);
      appointmentStub.onCall(1).returns(null);

      await appointmentController.createAppointment({
        arrivalTime: validArrivalTime,
        doctorId: DOCTOR_ID,
        userId: USER_ID,
      })
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(availabilityStub.calledOnce).to.be.true;
          expect(appointmentStub.calledTwice).to.be.true;
          expect(err.message).to.eql('No slots available for the selected doctor at that time');
        })
        .finally(() => {
          appointmentStub.restore();
          availabilityStub.restore();
        });
    });

    it('should create an appointment correctly', async () => {
      const validArribalTimeSlot = new Date(validArrivalTime).getTime();
      const availabilityStub = sinon.stub(Availability, 'getAllSlots').returns([validArribalTimeSlot]);
      const appointmentStub = sinon.stub(Appointment, 'findOne');
      const createStub = sinon.stub(Appointment, 'create').returns(outputMockData.fakeAppointment);
      appointmentStub.onCall(0).returns(null);
      appointmentStub.onCall(1).returns(null);

      await appointmentController.createAppointment({
        arrivalTime: validArrivalTime,
        doctorId: DOCTOR_ID,
        userId: USER_ID,
      })
        .then((appt) => {
          expect(availabilityStub.calledOnce).to.be.true;
          expect(appointmentStub.calledTwice).to.be.true;
          expect(createStub.calledOnce).to.be.true;

          expect(appt).to.have.property('id').that.is.a('number');
          expect(appt).to.have.property('doctorId').that.is.a('number');
          expect(appt).to.have.property('officeId').that.is.a('number');
          expect(appt).to.have.property('status').that.is.a('string');
          expect(appt).to.have.property('arrivalTime').that.is.a('string');
        })
        .finally(() => {
          appointmentStub.restore();
          availabilityStub.restore();
          createStub.restore();
        });
    });
  });

  describe('getAppointmentsByUserId', () => {
    it('should throw an error when no user ID provided', async () => {
      await appointmentController.getAppointmentsByUserId()
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql('User ID is required');
        });
    });

    it('should return an empty list when user doesnt have an availability', async () => {
      const mockedRecords = outputMockData.getAppointmentsByUserId(USER_IDS[5]);
      const findAllStub = sinon.stub(Appointment, 'findAll').returns(mockedRecords);

      await appointmentController.getAppointmentsByUserId(USER_ID, false)
        .then((appointments) => {
          expect(findAllStub.calledOnce).to.be.true;
          expect(appointments).to.be.an('array').that.is.empty;
        })
        .finally(() => {
          findAllStub.restore();
        });
    });

    it('should return the appointments', async () => {
      const mockedRecords = outputMockData.getAppointmentsByUserId(USER_ID);
      const findAllStub = sinon.stub(Appointment, 'findAll').returns(mockedRecords);

      await appointmentController.getAppointmentsByUserId(USER_ID, false)
        .then((appointments) => {
          expect(findAllStub.calledOnce).to.be.true;
          expect(appointments).to.equal(mockedRecords);
          expect(appointments).to.have.lengthOf(1);
        })
        .finally(() => {
          findAllStub.restore();
        });
    });
  });

  describe('userUpdateAppointment', () => {
    const pastArrivalTime = '2020-01-01T00:00:00.000Z';
    const validArrivalTime = '2023-01-01T00:00:00.000Z';

    it('should throw an error when no appt ID provided', async () => {
      await appointmentController.userUpdateAppointment()
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql('Appointment ID is required');
        });
    });

    it('should throw an error when arrival time is at a past time', async () => {
      await appointmentController.userUpdateAppointment(APPOINTMENT_ID, {
        arrivalTime: pastArrivalTime,
      })
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql('Cannot create an appointment at a past time');
        });
    });

    it('should throw an error when there are no slots available for the selected doctor', async () => {
      const availabilityStub = sinon.stub(Availability, 'getAllSlots').returns([]);
      await appointmentController.userUpdateAppointment(APPOINTMENT_ID, {
        arrivalTime: validArrivalTime,
      })
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql('No slots available for the selected doctor at that time');
        })
        .finally(() => {
          availabilityStub.restore();
        });
    });

    it('should throw an error when there are slots available for the selected doctor but does not include the sent one', async () => {
      const availabilityStub = sinon.stub(Availability, 'getAllSlots').returns([new Date().getTime()]);
      await appointmentController.userUpdateAppointment(APPOINTMENT_ID, {
        arrivalTime: validArrivalTime,
      })
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql('No slots available for the selected doctor at that time');
        })
        .finally(() => {
          availabilityStub.restore();
        });
    });

    it('should throw an error if the appointment is not found', async () => {
      const availabilityStub = sinon.stub(Availability, 'getAllSlots').returns([new Date(validArrivalTime).getTime()]);
      const appointmentStub = sinon.stub(Appointment, 'findOne').returns(null);
      await appointmentController.userUpdateAppointment(APPOINTMENT_ID, {
        arrivalTime: validArrivalTime,
      })
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql(`Appointment "${APPOINTMENT_ID}" not found.`);
        })
        .finally(() => {
          availabilityStub.restore();
          appointmentStub.restore();
        });
    });

    it('should update the appointment correctly', async () => {
      const updateResponse = 'Appointment updated successfully';
      const availabilityStub = sinon.stub(Availability, 'getAllSlots').returns([new Date(validArrivalTime).getTime()]);
      const appointmentStub = sinon.stub(Appointment, 'findOne').returns(outputMockData.fakeAppointment);
      const updateStub = sinon.stub(Appointment, 'update').returns(updateResponse);

      await appointmentController.userUpdateAppointment(APPOINTMENT_ID, {
        arrivalTime: validArrivalTime,
      })
        .then((response) => {
          expect(availabilityStub.calledOnce).to.be.true;
          expect(appointmentStub.calledOnce).to.be.true;
          expect(updateStub.calledOnce).to.be.true;
          expect(response).to.eql(updateResponse);
        })
        .finally(() => {
          availabilityStub.restore();
          appointmentStub.restore();
          updateStub.restore();
        });
    });
  });

  describe('editAppointment', () => {
    it('should throw an error when no appointment ID provided', async () => {
      await appointmentController.editAppointment({})
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql('Appointment ID is required');
        });
    });

    it('should throw an error when no status is provided', async () => {
      await appointmentController.editAppointment({
        id: APPOINTMENT_ID,
      })
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql('Cannot edit an appointment without a valid status');
        });
    });

    it('should throw an error when status is provided but is not valid', async () => {
      await appointmentController.editAppointment({
        id: APPOINTMENT_ID,
        status: 'invalid',
      })
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql('Cannot edit an appointment without a valid status');
        });
    });

    it('should throw an error when appointment is valid but not found', async () => {
      const findOneStub = sinon.stub(Appointment, 'findOne').returns(null);
      await appointmentController.editAppointment({
        id: APPOINTMENT_ID,
        status: APPOINTMENT_STATUS.CONFIRMED,
      })
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql(`Appointment "${APPOINTMENT_ID}" not found.`);
        })
        .finally(() => {
          findOneStub.restore();
        });
    });

    it('should update the appointment correctly', async () => {
      const updateResponse = 'Appointment updated successfully';
      const findOneStub = sinon.stub(Appointment, 'findOne').returns(outputMockData.fakeAppointment);
      const updateStub = sinon.stub(Appointment, 'update').returns(updateResponse);

      await appointmentController.editAppointment({
        id: APPOINTMENT_ID,
        status: APPOINTMENT_STATUS.CONFIRMED,
      })
        .then((response) => {
          expect(findOneStub.calledOnce).to.be.true;
          expect(updateStub.calledOnce).to.be.true;
          expect(response).to.equal(updateResponse);
        })
        .finally(() => {
          findOneStub.restore();
          updateStub.restore();
        });
    });
  });

  describe('deleteAppointment', () => {
    it('should throw an error when no appointment ID provided', async () => {
      await appointmentController.deleteAppointment()
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql('Appointment ID is required');
        });
    });

    it('should delete the appointment correctly', async () => {
      const deleteStub = sinon.stub(Appointment, 'destroy');
      await appointmentController.deleteAppointment(APPOINTMENT_ID)
        .then(() => {
          expect(deleteStub.calledOnce).to.be.true;
        })
        .finally(() => {
          deleteStub.restore();
        });
    });
  });

  describe('getAllAppointments', () => {
    const notAdminParams = { attributes: ['doctorId', 'arrivalTime'] };
    const adminParams = { include: [{ model: Doctor }, { model: User }] };

    it('should get all appointments without Doctor and User model', async () => {
      const findAllStub = sinon.stub(Appointment, 'findAll').returns([outputMockData.fakeAppointment]);
      await appointmentController.getAllAppointments(false)
        .then(() => {
          expect(findAllStub.calledOnce).to.be.true;
          expect(findAllStub.calledWith(notAdminParams)).to.be.true;
        })
        .finally(() => {
          findAllStub.restore();
        });
    });

    it('should get all appointments with Doctor and User model', async () => {
      const findAllStub = sinon.stub(Appointment, 'findAll').returns([outputMockData.fakeAppointment]);
      await appointmentController.getAllAppointments(true)
        .then(() => {
          expect(findAllStub.calledOnce).to.be.true;
          expect(findAllStub.calledWith(adminParams)).to.be.true;
        })
        .finally(() => {
          findAllStub.restore();
        });
    });
  });

  describe('startChat', () => {
    it('should throw an error when no appointment ID provided', async () => {
      await appointmentController.startChat()
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql('Appointment ID is required');
        });
    });

    it('should throw an error when the appointment requested was not found', async () => {
      const findOneStub = sinon.stub(Appointment, 'findOne').returns(null);
      await appointmentController.startChat(APPOINTMENT_ID)
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(findOneStub.calledOnce).to.be.true;
          expect(err.message).to.eql(`Appointment "${APPOINTMENT_ID}" not found.`);
        })
        .finally(() => {
          findOneStub.restore();
        });
    });

    // TODO: Add startChat happy path test. We need to mock rabbitMQ queue properly
  });

  describe('userConfirmAppointment', () => {
    it('should throw an error when no appointment ID provided', async () => {
      await appointmentController.userConfirmAppointment()
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql('Appointment ID is required');
        });
    });

    it('should confirm the appointment correctly', async () => {
      const updateResponse = 'Appointment updated successfully';
      const updateStub = sinon.stub(Appointment, 'update').returns(updateResponse);
      await appointmentController.userConfirmAppointment(APPOINTMENT_ID)
        .then((response) => {
          expect(updateStub.calledOnce).to.be.true;
          expect(response).to.equal(updateResponse);
        })
        .finally(() => {
          updateStub.restore();
        });
    });
  });

  describe('getHistoryBetween', () => {
    it('should get the history between', async () => {
      const findAllStub = sinon.stub(Appointment, 'findAll').returns([]);

      await appointmentController.getHistoryBetween({
        userId: USER_ID,
        doctorId: DOCTOR_ID,
      })
        .then((appointments) => {
          expect(findAllStub.calledOnce).to.be.true;
          expect(appointments).to.be.an('array').that.is.empty;
        })
        .finally(() => {
          findAllStub.restore();
        });
    });
  });

  describe('upsertNotes', () => {
    it('should throw an error when no appointment ID provided', async () => {
      await appointmentController.upsertNotes()
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql('Appointment ID is required');
        });
    });

    it('should throw an error when notes are not provided', async () => {
      await appointmentController.upsertNotes(APPOINTMENT_ID, {})
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql('You must provide notes');
        });
    });

    it('should upsert the notes correctly', async () => {
      const updateStub = sinon.stub(Appointment, 'update');
      await appointmentController.upsertNotes(APPOINTMENT_ID, { notes: 'some notes' })
        .then(() => {
          expect(updateStub.calledOnce).to.be.true;
        })
        .finally(() => {
          updateStub.restore();
        });
    });
  });

  describe('markAssisted', () => {
    it('should throw an error when no appointment ID provided', async () => {
      await appointmentController.markAssisted()
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql('Appointment ID is required');
        });
    });

    it('should mark the appointment assisted correctly', async () => {
      const updateParams = { assisted: true };
      const updateStub = sinon.stub(Appointment, 'update');
      await appointmentController.markAssisted(APPOINTMENT_ID)
        .then(() => {
          expect(updateStub.calledOnce).to.be.true;
          expect(updateStub.calledWith(updateParams)).to.be.true;
        })
        .finally(() => {
          updateStub.restore();
        });
    });
  });
});
