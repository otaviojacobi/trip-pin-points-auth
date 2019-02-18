'use strict';

require('dotenv').config()
const fs = require('fs');
const jwt = require('jsonwebtoken');
const express = require('express');
const httpStatus = require('http-status-codes');
const bodyParser = require('body-parser');
const app = express();
const db = require('./db');

const admin = require('./adminRouter');

const privateKey = fs.readFileSync('./private.key', 'utf8');
const dbClient = db.getClient();

app.use(bodyParser.json());
app.use('/admin', admin);

app.get('/healthcheck', async (req, res) => {
  try {
    const result = await dbClient.query(`SELECT 'ok'`);
    res.status(httpStatus.OK).send(result);
  } catch(err) {
    console.log('Error querying databse', err);
    res.status(httpStatus.SERVICE_UNAVAILABLE).send({status: httpStatus.SERVICE_UNAVAILABLE, message: 'An error happened while trying to query the db'});
  }
});

app.put('/register', async (req, res) => {
  try {
    const queryResult = await dbClient.query(`
    INSERT INTO users
    (
      username,
      email,
      scopes,
      password
    ) VALUES
    (
      $1,
      $2,
      'user',
      crypt($3, gen_salt('bf'))
    ) RETURNING *`, Object.values(req.body));

    const result = queryResult[0];
    const payload = {};
    payload.scopes = result.scopes.split(',');
    result.token = jwt.sign(payload, privateKey, { expiresIn:  "12h", algorithm:  "RS256"});
    delete result.password;

    res.status(httpStatus.CREATED).send(result);

  } catch(err) {
    console.error('Error while registering user', err);
    res.status(httpStatus.BAD_REQUEST).send({status: httpStatus.BAD_REQUEST, message: 'Failed to register user'});
  }

});

app.put('/token', async (req, res) => {

  try {
    const queryResult = await dbClient.query(`
    SELECT scopes
    FROM users
    WHERE 
      username=$1 AND
      password=crypt($2, password)
    `, Object.values(req.body));

    if(queryResult.length === 0) {
      return res.status(httpStatus.UNAUTHORIZED).send({status: httpStatus.UNAUTHORIZED, message: 'Invalid Credentials'});
    }

    //const token = jwt.sign(payload, privateKey, { expiresIn:  "12h", algorithm:  "RS256"});
    
    res.status(200).send(queryResult);
  } catch(err) {
    console.error('Error while querying for user', err);
    res.status(httpStatus.BAD_REQUEST).send({status: httpStatus.BAD_REQUEST, message: 'Failed to get token'});
  }
});

app.listen(3001, () => {
  console.log('Application listening on port 3001');
})