const express = require('express');
const { errorHandler } = require('@healy-tp/common');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const cookieSession = require('cookie-session');

const routes = require('./routes/api');

const app = express();

app.use(helmet());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(
  cookieSession({
    signed: false,
    secure: false,
  }),
);

app.use('/api', routes);

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'x-access-token, Origin, Content-Type, Accept',
  );
  next();
});

app.use(errorHandler);

module.exports = app;
