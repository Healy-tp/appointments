const sinon = require('sinon');

const rabbitmq = require('../src/services/rabbitmq/sender');

before(() => {
  // sinon.stub(logger, 'info').returns(null);
  // sinon.stub(logger, 'error').returns(null);
  sinon.stub(rabbitmq, 'sendMessage').returns(null);
});
