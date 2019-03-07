'use strict';

const db = require('../db');
const httpStatus = require('http-status-codes');

function _handleErr(err, res) {
  const handledErr = db.handleDbError(err);
  res.status(handledErr.status).send(handledErr);
}

function _formatDbResult(dbResult) {

  const formattedResult = dbResult.map(result =>  {
    const results = result.row.slice(1,-1).split(',');
    const scopes = results.slice(3);
    return {id: +results[0], username: results[1], email: results[2], scopes};
  });

  if(formattedResult.length === 1) {
    return formattedResult[0];
  }
  return formattedResult;
}

async function handleDeployTable(req, res) {
  const client = db.getClient();
  try {
    const createResult = await client.query(`
    CREATE EXTENSION pgcrypto;
    CREATE TABLE IF NOT EXISTS users 
      (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        scopes TEXT NOT NULL,
        password TEXT NOT NULL
      );
    `);
    res.status(httpStatus.OK).send(createResult);
  } catch(err) {
    res.status(httpStatus.SERVICE_UNAVAILABLE).send({status: httpStatus.SERVICE_UNAVAILABLE, message: err.toString()});
  }
}

async function handleGetSingleUser(req, res) {
  const client = db.getClient();
  const user = await client.query(`
  SELECT (id, username, email, scopes) FROM users WHERE id=$1
  `, [req.params.id]);
  res.status(httpStatus.OK).send(_formatDbResult(user));
}

async function handleGetUsers(req, res) {
  const client = db.getClient();
  const users = await client.query(`SELECT (id, username, email, scopes) FROM users`);
  res.status(httpStatus.OK).send(_formatDbResult(users));
}

async function createAdmin(req, res) {
  const dbClient = db.getClient();
  try {

    if(!req.body.username || !req.body.email || !req.body.password) {
      return res.status(httpStatus.BAD_REQUEST).send({
        status: httpStatus.BAD_REQUEST,
        message: 'Invalid register payload. username, email and password are reqired'
      });
    }
    await dbClient.query(`
    INSERT INTO users (
      username,
      email,
      scopes,
      password
    ) VALUES (
      $1,
      $2,
      'admin,user',
      crypt($3, gen_salt('bf'))
    ) RETURNING *`, [req.body.username, req.body.email, req.body.password]);

    res.status(httpStatus.CREATED).send({status: 'created'});

  } catch(err) {
    console.error('Error while registering user', err);
    _handleErr(err, res);
  }
}

module.exports = {
  handleDeployTable,
  handleGetSingleUser,
  handleGetUsers,
  createAdmin
};
