/* eslint-disable no-unused-expressions */
/* eslint-disable global-require */
const sinon = require('sinon');
const chai = require('chai');
const moment = require('moment');

const { expect } = chai;

const outputMockData = require('./mockData/appointment');

const { Appointment } = require('../../src/db/models/appointment');
const { Availability } = require('../../src/db/models/availability');
const { APPOINTMENT_STATUS } = require('../../src/utils/constants');
const pdfGenerator = require('../../src/services/pdf-generator')


const tomorrow = moment().add(1, 'days');
const oneWeekFromNow = moment().add(7, 'days');;
const yesterday = moment().subtract(1, 'days');

describe('controllers/appointment', () => {
  let modelStub;
  let apptController;

  before(() => {
    // import file to test
    apptController = require('../../src/controllers/appointment');
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

    it('Should thrown an error when unexpected exception is raised', async () => {
      const findAllStub = sinon.stub(Appointment, 'findAll').throws(new Error('Unexpected error'));
      await apptController.getAppointmentsByUserId(1, false)
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql('Unexpected error');
        });
      expect(findAllStub.calledOnce).to.be.true;
      findAllStub.restore();
    });
  });

  describe('createAppointment', () => {
    it('should throw an error if the arrival time is in the past', async () => {      
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

    it('throw an error if there are missing required fields', async () => {
      await apptController.createAppointment({
        arrivalTime: tomorrow.toJSON(),
        officeId: 2,
        userId: 3,
        isExtraAppt: false,
      }, false)
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql('Missing required fields');
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

      const getAllSlotsStub = sinon.stub(Availability, 'getAllSlots').returns([tomorrow.valueOf()]);
      const response = await apptController.createAppointment(apptDetails, false);

      expect(getAllSlotsStub.calledOnce).to.be.true;
      expect(response).to.be.eql(apptDetails);
      expect(createStub.calledOnce).to.be.true;
      createStub.restore();
      getAllSlotsStub.restore();
    });

    it('should create an extra appointment successfully', async () => {
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
      const getAllSlotsStub = sinon.stub(Availability, 'getAllSlots').returns([tomorrow.valueOf()]);

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

    it('should throw an error if trying to update an appointment within 72 hrs of arrival time', async () => {
      const getAllSlotsStub = sinon.stub(Availability, 'getAllSlots').returns([tomorrow.valueOf()]);

      const userId = 1;
      const updates = { arrivalTime: tomorrow.toJSON(), officeId: 1 };
      const fakeApptObj = { userId, arrivalTime: moment().add(12, 'hours') };
      const findOneStub = sinon.stub(Appointment, 'findOne').returns(fakeApptObj);

      await apptController.userUpdateAppointment(1, updates, userId)
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql('Cannot update appointment within  72 hrs of arrival time');
          expect(getAllSlotsStub.calledOnce).to.be.true;
          getAllSlotsStub.restore();
          findOneStub.restore();
        });
    });

    it('should update appointment successfully', async () => {
      const getAllSlotsStub = sinon.stub(Availability, 'getAllSlots').returns([tomorrow.valueOf()]);

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

    it('should throw an error if trying to edit appt without id', async () => {
      const editions = {};
      await apptController.editAppointment(editions)
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql('Appointment ID is required');
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

    it('should throw an error when unexpected exception is raised', async () => {
      const userId = 1;
      modelStub = sinon.stub(Appointment, 'findOne').returns({ userId: 1});
      const destroyApptStub = sinon.stub(Appointment, 'destroy').throws(new Error("Unexpected error"));
      await apptController.deleteAppointment(1, userId)
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(modelStub.calledOnce).to.be.true;
          expect(err.message).to.eql('Unexpected error');
          destroyApptStub.restore();
        });
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
    it('should thrown an error when unexpecter exception is raised', async () => {
      modelStub = sinon.stub(Appointment, 'findAll').throws(new Error('Unexpected error'));
      await apptController.getAllAppointments()
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(modelStub.calledOnce).to.be.true;
          expect(err.message).to.eql('Unexpected error');
        });
    });


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
    it('should throw an error is apptId is not provided', async () => {
      await apptController.startChat(undefined)
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql('Appointment ID is required');
        });
    });

    it('should throw an error if chat cannot be started', async () => {
      modelStub = sinon.stub(Appointment, 'findOne').returns({ canStartChat: sinon.stub().returns(false) });
      const response = await apptController.startChat(1)
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql('You can only start a chat within 7 days of your appointment or 15 days past it.');
          expect(modelStub.calledOnce).to.be.true;
        });
    });

    it('should be able to start chat successfully', async () => {
      modelStub = sinon.stub(Appointment, 'findOne').returns({ canStartChat: sinon.stub().returns(true) });
      const response = await apptController.startChat(1);
      expect(modelStub.calledOnce).to.be.true;
      expect(response).to.be.undefined;
    });
  });

  describe('getAppointmentsInInterval', () => {
    it('should throw an error if an unexpected exception is raised', async () => {
      const mockedRecords = outputMockData.getMockAppointments();
      modelStub = sinon.stub(Appointment, 'findAll').throws(new Error('Unexpected error'));
      await apptController.getAppointmentsInInterval(2)
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql('Unexpected error');
          expect(modelStub.calledOnce).to.be.true;
        });
    });

    it('should be able to get all appointments in interval successfully', async () => {
      const mockedRecords = outputMockData.getMockAppointments();
      modelStub = sinon.stub(Appointment, 'findAll').returns(mockedRecords);
      const response = await apptController.getAppointmentsInInterval(2);
      expect(modelStub.calledOnce).to.be.true;
      expect(response).to.be.eql(mockedRecords);
    });
  });

  describe('doctorAppointmentCancellation', () => {
    it('should cancel appointment successfully', async () => {
      modelStub = sinon.stub(Appointment, 'findByPk').returns({
        update: sinon.stub().returns(null),
      });

      const appt1 = { arrivalTime: tomorrow.toDate() };
      const appt2 = { arrivalTime: tomorrow.add(1, 'days').toDate() };

      const av1 = tomorrow;
      const av2 = tomorrow.add(1, 'days');
      const av3 = av2.add(1, 'days');

      const newAppt = {
        arrivalTime: av3.toJSON(),
        doctorId: 1,
        officeId: 2,
        status: APPOINTMENT_STATUS.TO_CONFIRM,
      };

      const av3Day = av3.day();
      const offices = {
        av3Day: 2,
      };

      const allApptsDoctorStub = sinon.stub(Appointment, 'getAllAppointmentsForDoctor').returns([appt1, appt2]);
      const allAvailabilitiesStub = sinon.stub(Availability, 'getAllAvailableSlotsForDoctor').returns(
        [[av1.toDate(), av2.toDate(), av3.toDate()], offices]
      );
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

  describe('doctorDayCancellation', () => {
    let canceledDay, dayAfter;
    beforeEach(() => {
      canceledDay = moment().add(2, 'days').toJSON().slice(0, 10);
      dayAfter = moment().add(3, 'days').toJSON().slice(0, 10);
    });

    it('should cancel day successfully and reschedule appts without extra appts', async () => {
      const canceledAppt = {
        userId: 1,
        doctorId: 2
      }

      // Mock update appt
      const updateStub = sinon.stub(Appointment, 'update').returns([1, [canceledAppt]]);
      
      // Mock getAllAppointmentsForDoctor
      const apptsForDoctor = [
        { arrivalTime: new Date(`${dayAfter} 10:00`) },
      ];
      const getAllApptsForDoctorStub = sinon.stub(Appointment, 'getAllAppointmentsForDoctor').returns(apptsForDoctor);

      // Mock getAllAvailableSlotsForDoctor
      const av1 = new Date(`${dayAfter} 10:00`);
      const av2 = new Date(`${dayAfter} 10:30`);
      const av2Day = av2.getDay();
      const availableSlotsForDoctor = [av1, av2];
      const getAllAvailableSlotsForDoctorStub = sinon.stub(Availability, 'getAllAvailableSlotsForDoctor')
        .returns([availableSlotsForDoctor, [{[av2Day]: 22}]]);


      // Mock CreateStub
      const apptCreateStub = sinon.stub(Appointment, 'create');

      await apptController.doctorDayCancelation(2, canceledDay);

      expect(apptCreateStub.calledOnce).to.be.true;
      updateStub.restore();
      getAllApptsForDoctorStub.restore();
      getAllAvailableSlotsForDoctorStub.restore();
      apptCreateStub.restore();
    });

    it('should cancel day successfully and reschedule appts USING extra appts', async () => {
      const canceledAppt = {
        userId: 1,
        doctorId: 2
      }

      // Mock update appt
      const updateStub = sinon.stub(Appointment, 'update').returns([1, [canceledAppt]]);
      
      // Mock getAllAppointmentsForDoctor
      const apptsForDoctor = [
        { arrivalTime: new Date(`${dayAfter} 10:00`) },
        { arrivalTime: new Date(`${dayAfter} 10:30`) },
      ];
      const getAllApptsForDoctorStub = sinon.stub(Appointment, 'getAllAppointmentsForDoctor').returns(apptsForDoctor);

      // Mock getAllAvailableSlotsForDoctor
      const av1 = new Date(`${dayAfter} 10:00`);
      const av2 = new Date(`${dayAfter} 10:30`);
      const av2Day = av2.getDay();
      const availableSlotsForDoctor = [av1, av2];
      const getAllAvailableSlotsForDoctorStub = sinon.stub(Availability, 'getAllAvailableSlotsForDoctor')
        .returns([availableSlotsForDoctor, [{[av2Day]: 22}]]);

      
      // Mock getAvailableExtraAppointments
      const getAvExtraApptsStub = sinon.stub(Availability, 'getAvailableExtraAppointments').returns({
        [new Date(dayAfter).getTime()]: 5
      });

      // Mock getAllExtraAppointmentsForDoctor
      const getAllExtraApptsForDoctorStub = sinon.stub(Appointment, 'getAllExtraAppointmentsForDoctor').returns([
        {
          dataValues: {
            extraAppt: dayAfter,
            count: 3
          }
        }
      ])

      // Mock CreateStub
      const apptCreateStub = sinon.stub(Appointment, 'create');

      await apptController.doctorDayCancelation(2, canceledDay);

      expect(getAvExtraApptsStub.calledOnce).to.be.true;
      expect(getAllExtraApptsForDoctorStub.calledOnce).to.be.true;
      expect(apptCreateStub.calledOnce).to.be.true;
      updateStub.restore();
      getAllApptsForDoctorStub.restore();
      getAllAvailableSlotsForDoctorStub.restore();
      apptCreateStub.restore();
    });

    it('should throw an error if no doctorId was provided', async () => {
      await apptController.doctorDayCancelation(undefined, canceledDay)
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql('Doctor ID is required');
        });
    });
  })

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

    it('should throw an error if not apptId was provided', async () => {
      await apptController.markAssisted(undefined)
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql('Appointment ID is required');
        });
    });

    it('should throw an error if an unexpected exception is raised', async () => {
      modelStub = sinon.stub(Appointment, 'update').throws(new Error('Unexpected error'));
      await apptController.markAssisted(1)
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(err.message).to.eql('Unexpected error');
          modelStub.restore();
        });
    });
  });

  describe('exportPDF', () => {
    it('exports a PDF successfully', async () => {
      const apptFindAllStub = sinon.stub(Appointment, 'findAll').returns([]);
      const generatePDFStub = sinon.stub(pdfGenerator, 'generatePDF').returns('test-file-name');

      const response = await apptController.exportPDF(1, 2);

      expect(apptFindAllStub.calledOnce).to.be.true;
      expect(generatePDFStub.calledOnce).to.be.true;
      expect(response).to.be.eql('test-file-name');
      apptFindAllStub.restore();
      generatePDFStub.restore();
    });

    it('should throw an error if an unexpected exception is raised', async () => {
      const apptFindAllStub = sinon.stub(Appointment, 'findAll').throws(new Error('Unexpected error'));
  
      await apptController.exportPDF(1, 2)
        .then(() => {
          expect('this should not have been called').to.be.false;
        })
        .catch((err) => {
          expect(apptFindAllStub.calledOnce).to.be.true;
          expect(err.message).to.eql('Unexpected error');
          apptFindAllStub.restore();
        });
    });
  });
});
