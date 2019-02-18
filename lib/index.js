'use strict';

require('dotenv').config()

const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const adminRouter = require('./routers/adminRouter');
const baseRouter = require('./routers/baseRouter');

app.use(bodyParser.json());
app.use('/', baseRouter);
app.use('/admin', adminRouter);

app.listen(3001, () => {
  console.log('Application listening on port 3001');
})
