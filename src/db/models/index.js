const { Appointment } = require('./appointment');
const { Availability } = require('./availability');
const { Doctor } = require('./doctor');
const { Office } = require('./office');
const { User } = require('./user');

const db = {
  Appointment, Availability, Doctor, Office, User,
};

const associate = () => {
  Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
  });
};

module.exports = { associate };
