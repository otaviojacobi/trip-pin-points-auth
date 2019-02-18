'use strict';

const httpStatus = require('http-status-codes');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { privateKey }= require('../keys');
const dbClient = db.getClient();

async function handleHealthcheck(req, res) {
  try {
    const result = await dbClient.query(`SELECT 'ok'`);
    res.status(httpStatus.OK).send(result);
  } catch(err) {
    console.log('Error querying databse', err);
    res.status(httpStatus.SERVICE_UNAVAILABLE).send({status: httpStatus.SERVICE_UNAVAILABLE, message: 'An error happened while trying to query the db'});
  }
}

async function handleRegister(req, res) {
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

    // TODO: modularize
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
}

async function handleToken(req, res) {
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

    console.log(queryResult);

    const payload = { scopes: queryResult[0].scopes.split(',') };

    const token = jwt.sign(payload, privateKey, { expiresIn:  "12h", algorithm:  "RS256"});
    
    res.status(200).send({token});
  } catch(err) {
    console.error('Error while querying for user', err);
    res.status(httpStatus.BAD_REQUEST).send({status: httpStatus.BAD_REQUEST, message: 'Failed to get token'});
  }
}

module.exports = {
  handleHealthcheck,
  handleRegister,
  handleToken
}