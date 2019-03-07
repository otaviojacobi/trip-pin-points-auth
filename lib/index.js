'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const adminRouter = require('./routers/adminRouter');
const baseRouter = require('./routers/baseRouter');

app.use(bodyParser.json());
app.use('/', baseRouter);
app.use('/admin', adminRouter);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Application listening on port ${PORT}`);
});
