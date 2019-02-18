'use strict';

const db = require('../db');
const httpStatus = require('http-status-codes');

function _formatDbResult(dbResult) {

  const formattedResult = dbResult.map(result =>  {
    const results = result.row.slice(1,-1).split(',');
    const scopes = results.slice(3);
    return {id: results[0], name: results[1], email: results[2], scopes};
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
  const users = await client.query(`
  SELECT (id, username, email, scopes) FROM users
  `);
  res.status(httpStatus.OK).send(_formatDbResult(users));
}

module.exports = {
  handleDeployTable,
  handleGetSingleUser,
  handleGetUsers
};
