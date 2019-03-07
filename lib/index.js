'use strict';

const fs = require('fs');
const keypair = require('keypair');
const pair = keypair();

const express = require('express');
const bodyParser = require('body-parser');
const app = express();

console.log('starting to write...');

fs.writeFileSync('./lib/keys/private.key', pair.private);
fs.writeFileSync('./lib/keys/public.key', pair.public);

console.log('finished to write...');

fs.readdirSync('./lib/keys').map(console.log);

const adminRouter = require('./routers/adminRouter');
const baseRouter = require('./routers/baseRouter');

app.use(bodyParser.json());
app.use('/', baseRouter);
app.use('/admin', adminRouter);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Application listening on port ${PORT}`);
});
