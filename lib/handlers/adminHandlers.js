'use strict';

const db = require('../db');
const httpStatus = require('http-status-codes');

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

module.exports = {
  handleDeployTable
}