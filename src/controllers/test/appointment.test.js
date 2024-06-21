/* eslint-disable no-unused-expressions */
/* eslint-disable global-require */


const sinon = require('sinon');
const chai = require('chai');

const { expect } = chai;

const outputMockData = require('../mockData/appointment');


const { Appointment } = require('../../db/models/appointment');
const { Availability } = require('../../db/models/availability');
const { APPOINTMENT_STATUS } = require('../../utils/constants');

const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1));
const oneWeekFromNow = new Date(new Date().setDate(new Date().getDate() + 7));

describe('controllers/appointment', () => {
  let modelStub;
  let apptController;

  before(() => {
    // import file to test
    apptController = require('../appointment');
  });

  afterEach(() => {
    modelStub.restore();
  });

  describe('getAppointmentsByUserId', () => {
    it('should return all appointments by user id', async () => {
      const mockedRecords = outputMockData.getMockAppointments();
      modelStub = sinon.stub(Appointment, 'findAll').returns(mockedRecords);

      const records = await apptController.getAppointmentsByUserId(1, false);
      expect(modelStub.calledOnce).to.be.true;
      expect(records).to.equal(mockedRecords);
      expect(records).to.have.lengthOf(2);
    });
  });

  describe('createAppointment', () => {
    it('should throw an error if the arrival time is in the past', async () => {
      const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toJSON();
      await apptController.createAppointment({
        arrivalTime: yesterday,
        doctorId: 1,
        officeId: 2,
        userId: 3,
        isExtraAppt: false,
      }, false)
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql('Cannot create an appointment at a past time');
        });
    });

    it('should throw an error if an appointment was already scheduled at the arrival time', async () => {
      modelStub = sinon.stub(Appointment, 'findAll').returns(true);
      await apptController.createAppointment({
        arrivalTime: tomorrow.toJSON(),
        doctorId: 1,
        officeId: 2,
        userId: 3,
        isExtraAppt: false,
      }, false)
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql('Cannot create an appointment at that time!');
        });
    });

    it('should throw an error if the user already has an appointment that day', async () => {
      modelStub = sinon.stub(Appointment, 'findAll').onCall(0).returns(false);
      modelStub.onCall(1).returns(true);
      await apptController.createAppointment({
        arrivalTime: tomorrow.toJSON(),
        doctorId: 1,
        officeId: 2,
        userId: 3,
        isExtraAppt: false,
      }, false)
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql('You already have an appointment for that day');
        });
    });

    it('should throw an error if the doctor does not have an available slot at the selected time', async () => {
      modelStub = sinon.stub(Appointment, 'findAll').onCall(0).returns(false);
      modelStub.onCall(1).returns(false);
      const getAllSlotsStub = sinon.stub(Availability, 'getAllSlots').returns([]);
      await apptController.createAppointment({
        arrivalTime: tomorrow.toJSON(),
        doctorId: 1,
        officeId: 2,
        userId: 3,
        isExtraAppt: false,
      }, false)
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(getAllSlotsStub.calledOnce).to.be.true;
          expect(err.message).to.eql('No slots available for the selected doctor at that time');
          getAllSlotsStub.restore();
        });
    });

    it('should create an appointment successfully', async () => {
      modelStub = sinon.stub(Appointment, 'findAll').onCall(0).returns(false);
      modelStub.onCall(1).returns(false);

      const apptDetails = {
        arrivalTime: tomorrow.toJSON(),
        doctorId: 1,
        officeId: 2,
        userId: 3,
        isExtraAppt: false,
      };
      const createStub = sinon.stub(Appointment, 'create').returns(apptDetails);

      const getAllSlotsStub = sinon.stub(Availability, 'getAllSlots').returns([tomorrow.getTime()]);
      const response = await apptController.createAppointment(apptDetails, false);

      expect(getAllSlotsStub.calledOnce).to.be.true;
      expect(response).to.be.eql(apptDetails);
      expect(createStub.calledOnce).to.be.true;
      createStub.restore();
      getAllSlotsStub.restore();
    });

    it('should create an extra appointment successfully', async () => {
      const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1));

      const apptDetails = {
        arrivalTime: tomorrow.toJSON(),
        doctorId: 1,
        officeId: 2,
        userId: 3,
        isExtraAppt: true,
      };
      const createStub = sinon.stub(Appointment, 'create').returns(apptDetails);

      const response = await apptController.createAppointment(apptDetails, true);

      expect(response).to.be.eql(apptDetails);
      expect(createStub.calledOnce).to.be.true;
      createStub.restore();
    });
  });

  describe('userUpdateAppointment', () => {
    it('should throw an error if trying to update an appt to a past time', async () => {
      const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toJSON();
      const updates = { arrivalTime: yesterday, officeId: 1 };
      await apptController.userUpdateAppointment(1, updates, 1)

        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql('Cannot create an appointment at a past time');
        });
    });

    it('should throw an error if doctor has not available slots at the selected time', async () => {
      const getAllSlotsStub = sinon.stub(Availability, 'getAllSlots').returns([]);
      const updates = { arrivalTime: tomorrow.toJSON(), officeId: 1 };
      await apptController.userUpdateAppointment(1, updates, 1)
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(getAllSlotsStub.calledOnce).to.be.true;
          expect(err.message).to.eql('No slots available for the selected doctor at that time');
          getAllSlotsStub.restore();
        });
    });

    it('should return false if appointment trying to be updated does not belong to userId', async () => {
      const getAllSlotsStub = sinon.stub(Availability, 'getAllSlots').returns([tomorrow.getTime()]);

      const userId = 1;
      const updates = { arrivalTime: tomorrow.toJSON(), officeId: 1 };
      const fakeApptObj = { userId: 2 };
      const findOneStub = sinon.stub(Appointment, 'findOne').returns(fakeApptObj);

      const response = await apptController.userUpdateAppointment(1, updates, userId);
      expect(getAllSlotsStub.calledOnce).to.be.true;
      expect(response).to.be.false;
      getAllSlotsStub.restore();
      findOneStub.restore();
    });

    it('should update appointment successfully', async () => {
      const getAllSlotsStub = sinon.stub(Availability, 'getAllSlots').returns([tomorrow.getTime()]);

      const userId = 1;
      const updates = { arrivalTime: tomorrow.toJSON(), officeId: 1 };
      const fakeApptObj = {
        userId: 1,
        arrivalTime: oneWeekFromNow,
        update: sinon.stub().returns(null),
      };
      const findOneStub = sinon.stub(Appointment, 'findOne').returns(fakeApptObj);

      const response = await apptController.userUpdateAppointment(1, updates, userId);
      expect(getAllSlotsStub.calledOnce).to.be.true;
      expect(response).to.be.eql(null);
      expect(fakeApptObj.update.calledOnce).to.be.true;
      getAllSlotsStub.restore();
      findOneStub.restore();
    });
  });

  describe('editAppointment', () => {
    it('should throw an error if trying to edit appt with undefined status', async () => {
      const editions = { id: 1, status: undefined };
      await apptController.editAppointment(editions)
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql('Cannot edit an appointment without a valid status');
        });
    });

    it('should throw an error if trying to edit appt with a non valid  status', async () => {
      const editions = { id: 1, status: 'not valid status' };
      await apptController.editAppointment(editions)

        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql('Cannot edit an appointment without a valid status');
        });
    });

    it('should throw an error if trying to edit an appt that was not found', async () => {
      const editions = { id: 1, status: 'confirmed' };
      modelStub = sinon.stub(Appointment, 'findOne').returns(false);
      await apptController.editAppointment(editions)
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(modelStub.calledOnce).to.be.true;
          expect(err.message).to.eql('Appointment "1" not found.');
        });
    });

    it('should edit appointment successfully', async () => {
      const editions = { id: 1, status: 'confirmed' };
      modelStub = sinon.stub(Appointment, 'findOne').returns(true);
      const updateStub = sinon.stub(Appointment, 'update').returns(null);
      const response = await apptController.editAppointment(editions);
      expect(response).to.be.eql(null);
      expect(modelStub.calledOnce).to.be.true;
      expect(updateStub.calledOnce).to.be.true;
      updateStub.restore();
    });
  });

  describe('deleteAppointment', () => {
    it('should return false when trying to update appointment that does not belong to user', async () => {
      const userId = 1;
      modelStub = sinon.stub(Appointment, 'findOne').returns({ userId: 2});
      const response = await apptController.deleteAppointment(1, userId);
      expect(modelStub.calledOnce).to.be.true;
      expect(response).to.be.eql(false);
    });

    it('should delete appointment successfully', async () => {
      const userId = 1;
      modelStub = sinon.stub(Appointment, 'findOne').returns({ userId });
      const destroyStub = sinon.stub(Appointment, 'destroy').returns(null);
      const response = await apptController.deleteAppointment(1, userId);
      expect(modelStub.calledOnce).to.be.true;
      expect(response).to.be.true;
      expect(destroyStub.calledOnce).to.be.true;
      destroyStub.restore();
    });
  });

  describe('getAllAppointments', () => {
    it('should be able to get all appointments successfully', async () => {
      const mockedRecords = outputMockData.getMockAppointments();
      modelStub = sinon.stub(Appointment, 'findAll').returns(mockedRecords);
      let response = await apptController.getAllAppointments();
      expect(modelStub.calledOnce).to.be.true;
      expect(response).to.be.eql(mockedRecords);
      response = await apptController.getAllAppointments(true);
      expect(modelStub.calledTwice).to.be.true;
      expect(response).to.be.eql(mockedRecords);
    });
  });

  describe('startChat', () => {
    it('should be able to start chat successfully', async () => {
      modelStub = sinon.stub(Appointment, 'findOne').returns({ canStartChat: sinon.stub().returns(true) });
      const response = await apptController.startChat(1);
      expect(modelStub.calledOnce).to.be.true;
      expect(response).to.be.undefined;
    });
  });

  describe('getAppointmentsInInterval', () => {
    it('should be able to get all appointments in interval successfully', async () => {
      const mockedRecords = outputMockData.getMockAppointments();
      modelStub = sinon.stub(Appointment, 'findAll').returns(mockedRecords);
      const response = await apptController.getAppointmentsInInterval(2);
      expect(modelStub.calledOnce).to.be.true;
      expect(response).to.be.eql(mockedRecords);
    });
  });

  describe('doctorAppointmentCancellation', () => {
    it('', async () => {
      modelStub = sinon.stub(Appointment, 'findByPk').returns({
        update: sinon.stub().returns(null),
      });

      const appt1 = { arrivalTime: new Date(new Date().setDate(new Date().getDate() + 1)) };
      const appt2 = { arrivalTime: new Date(new Date().setDate(new Date().getDate() + 2)) };

      const av1 = new Date(new Date().setDate(new Date().getDate() + 1));
      const av2 = new Date(new Date().setDate(new Date().getDate() + 2));
      const av3 = new Date(new Date().setDate(new Date().getDate() + 3));

      const newAppt = {
        arrivalTime: av3.toJSON(),
        doctorId: 1,
        officeId: 2,
        status: APPOINTMENT_STATUS.TO_CONFIRM,
      };

      const av3Day = av3.getDay();
      const offices = {
        av3Day: 2,
      };

      const allApptsDoctorStub = sinon.stub(Appointment, 'getAllAppointmentsForDoctor').returns([appt1, appt2]);
      const allAvailabilitiesStub = sinon.stub(Availability, 'getAllAvailableSlotsForDoctor').returns([[av1, av2, av3], offices]);
      const createStub = sinon.stub(Appointment, 'create').returns(newAppt);

      const response = await apptController.doctorAppointmentCancellation(1);

      expect(modelStub.calledOnce).to.be.true;
      expect(allApptsDoctorStub.calledOnce).to.be.true;
      expect(allAvailabilitiesStub.calledOnce).to.be.true;
      expect(createStub.calledOnce).to.be.true;
      expect(response).to.be.eql(newAppt);

      allApptsDoctorStub.restore();
      allAvailabilitiesStub.restore();
      createStub.restore();
    });
  });

  describe('userConfirmAppointment', () => {
    it('should confirm appt successfully', async () => {
      const mockedRecords = outputMockData.getMockAppointments();
      modelStub = sinon.stub(Appointment, 'update').returns(mockedRecords[0]);
      const response = await apptController.userConfirmAppointment(1);
      expect(modelStub.calledOnce).to.be.true;
      expect(response).to.be.eql(mockedRecords[0]);
    });
  });

  describe('getHistoryBetween', () => {
    it('should be able to get history between user and doctor successfully', async () => {
      const mockedRecords = outputMockData.getMockAppointments();
      modelStub = sinon.stub(Appointment, 'findAll').returns(mockedRecords);
      const response = await apptController.getHistoryBetween({ userId: 1, doctorId: 2 });
      expect(modelStub.calledOnce).to.be.true;
      expect(response).to.be.eql(mockedRecords);
    });
  });

  describe('upsertNotes', () => {
    it('should upsert notes successfully', async () => {
      const mockedRecords = outputMockData.getMockAppointments();
      modelStub = sinon.stub(Appointment, 'update').returns(mockedRecords[0]);
      const response = await apptController.upsertNotes(1, { text: 'test note' });
      expect(modelStub.calledOnce).to.be.true;
      expect(response).to.be.eql(undefined);
    });
  });

  describe('markAssisted', () => {
    it('should mark appt assisted successfully', async () => {
      const mockedRecords = outputMockData.getMockAppointments();
      modelStub = sinon.stub(Appointment, 'update').returns(mockedRecords[0]);
      const response = await apptController.markAssisted(1);
      expect(modelStub.calledOnce).to.be.true;
      expect(response).to.be.eql(undefined);
    });
  });
});
