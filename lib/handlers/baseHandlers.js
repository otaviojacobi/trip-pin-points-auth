'use strict';

const httpStatus = require('http-status-codes');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { privateKey }= require('../keys');

function _getToken(scopes) {
  return jwt.sign({ scopes }, privateKey, { expiresIn:  '12h', algorithm:  'RS256'});
}

function _handleErr(err, res) {
  const handledErr = db.handleDbError(err);
  res.status(handledErr.status).send(handledErr);
}

async function handleHealthcheck(req, res) {
  const dbClient = db.getClient();
  try {
    const result = await dbClient.query(`SELECT 'ok'`);
    res.status(httpStatus.OK).send(result);
  } catch(err) {
    console.log('Error querying databse', err);
    res.status(httpStatus.SERVICE_UNAVAILABLE).send({status: httpStatus.SERVICE_UNAVAILABLE, message: 'An error happened while trying to query the db'});
  }
}

async function handleRegister(req, res) {
  const dbClient = db.getClient();
  try {

    if(!req.body.username || !req.body.email || !req.body.password) {
      return res.status(httpStatus.BAD_REQUEST).send({
        status: httpStatus.BAD_REQUEST,
        message: 'Invalid register payload. username, email and password are reqired'
      });
    }

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
    ) RETURNING *`, [req.body.username, req.body.email, req.body.password]);

    res.status(httpStatus.CREATED).send({
      token: _getToken(queryResult[0].scopes.split(','))
    });

  } catch(err) {
    console.error('Error while registering user', err);
    _handleErr(err, res);
  }
}

async function handleToken(req, res) {
  const dbClient = db.getClient();
  try {
    const queryResult = await dbClient.query(`
    SELECT scopes
    FROM users
    WHERE 
      username=$1 AND
      password=crypt($2, password)
    `, Object.values(req.body));

    if(queryResult.length === 0) {
      return res.status(httpStatus.UNAUTHORIZED).send({
        status: httpStatus.UNAUTHORIZED,
        message: 'Invalid Credentials.',
      });
    }

    res.status(httpStatus.OK).send({
      token: _getToken(queryResult[0].scopes.split(','))
    });
  } catch(err) {
    console.error('Error while getting user token', err);
    _handleErr(err, res);
  }
}

module.exports = {
  handleHealthcheck,
  handleRegister,
  handleToken
};
