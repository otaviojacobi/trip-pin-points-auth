'use strict';

const fs = require('fs');
const keypair = require('keypair');
const pair = keypair();

const express = require('express');
const bodyParser = require('body-parser');
const app = express();

fs.writeFileSync(__dirname + '/keys/private.key', pair.private);
fs.writeFileSync(__dirname + '/keys/public.key', pair.public);

const adminRouter = require('./routers/adminRouter');
const baseRouter = require('./routers/baseRouter');

app.use(bodyParser.json());
app.use('/', baseRouter);
app.use('/admin', adminRouter);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Application listening on port ${PORT}`);
});
