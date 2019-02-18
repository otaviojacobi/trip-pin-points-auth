'use strict';

require('dotenv').config()
const fs = require('fs');
const jwt = require('jsonwebtoken');
const express = require('express');
const httpStatus = require('http-status-codes');
const app = express();
const db = require('./db');

const admin = require('./adminRouter');

const signOptions = {
 //issuer:  'Trip Ping Points Inc',
 //subject:  'secretemail@secret.com',
 //audience:  'idk',
 expiresIn:  "12h",
 algorithm:  "RS256"
};

const privateKey = fs.readFileSync('./private.key', 'utf8');

app.use('/admin', admin);

app.get('/healthcheck', async (req, res) => {
  try {
    const client = db.getClient();
    const result = await client.query(`SELECT 'ok'`);
    res.status(httpStatus.OK).send(result);
  } catch(err) {
    console.log('Error querying databse', err);
    res.status(httpStatus.SERVICE_UNAVAILABLE).send({status: httpStatus.SERVICE_UNAVAILABLE, message: 'An error happened while trying to query the db'});
  }
});

app.get('/register', (req, res) => {
  console.log('User successfully signed up');
});

app.get('/token', (req, res) => {

  const payload = {
    scopes: ["admin"]
  };

  const token = jwt.sign(payload, privateKey, signOptions);
  res.status(200).send(token);
});

app.listen(3001, () => {
  console.log('Application listening on port 3001');
})