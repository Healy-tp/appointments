const sinon = require('sinon');

const rabbitmq = require('../src/services/rabbitmq/sender');
const { sequelize } = require('../src/db/dbsetup');

before(() => {
  // sinon.stub(logger, 'info').returns(null);
  // sinon.stub(logger, 'error').returns(null);
  // sinon.stub(sequelize, 'transaction').returns(null);
  sinon.stub(rabbitmq, 'sendMessage').returns(null);
});

after((done) => {
  done();
});
