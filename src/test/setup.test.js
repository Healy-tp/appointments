const sinon = require('sinon');

const rabbitmq = require('../rabbitmq/sender');
// const logger = require('../logger');

before(() => {
  // sinon.stub(logger, 'info').returns(null);
  // sinon.stub(logger, 'error').returns(null);
  sinon.stub(rabbitmq, 'sendMessage').returns(null);
});
