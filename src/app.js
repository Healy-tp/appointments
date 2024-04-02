const express = require('express');
const cron = require('node-cron');

const { errorHandler } = require('@healy-tp/common');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cookieSession = require('cookie-session');

const routes = require('./routes/api');
const { checkAppointmentsForReminders } = require('./reminders');

cron.schedule('* * * * *', () => {
  checkAppointmentsForReminders();
});

const app = express();

app.use(helmet());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  cookieSession({
    signed: false,
    secure: false,
  }),
);

app.use('/api', routes);
app.use(errorHandler);

module.exports = app;
