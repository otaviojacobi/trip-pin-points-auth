'use strict';

require('dotenv').config()
const fs = require('fs');
const jwt = require('jsonwebtoken');
const express = require('express');
const pg = require('pg-promise')();
const httpStatus = require('http-status-codes');
const app = express();

const getConnectionString = require('./getConnectionString');
const admin = require('./adminRouter');

const signOptions = {
 issuer:  'Trip Ping Points Inc',
 subject:  'secretemail@secret.com',
 audience:  'idk',
 expiresIn:  "12h",
 algorithm:  "RS256"
};

const privateKey = fs.readFileSync('./private.key', 'utf8');

const pgClient = pg(getConnectionString());

app.use('/admin', admin);

app.get('/healthcheck', async (req, res) => {
  try {
    const result = await pgClient.query(`SELECT 'ok'`);
    res.status(httpStatus.OK).send(result);
  } catch(err) {
    console.log('Error querying databse', err);
    res.status(httpStatus.SERVICE_UNAVAILABLE).send({status: httpStatus.SERVICE_UNAVAILABLE, message: 'An error happened while trying to query the db'});
  }
});

app.get('/register', (req, res) => {
  console.log('User successfully signed up');w
});

app.get('/token', (req, res) => {

  const payload = {
    escopes: ["user"]
  };

  const token = jwt.sign(payload, privateKey, signOptions);
  res.status(200).send(token);
});

app.listen(3001, () => {
  console.log('Application listening on port 3001');
})