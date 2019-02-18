'use strict';

const pg = require('pg-promise')();
const httpStaus = require('http-status-codes');
const getConnectionString = require('./getConnectionString');

let postgresClient = null;

const ERR_UNIQUE_VIOLATED = 23505;

module.exports = {
  getClient: () => {
    if(!postgresClient) {
      postgresClient = pg(getConnectionString());
    }
    return postgresClient;
  },
  setClient: newClient => {
    postgresClient = newClient;
  },
  handleDbError: err => {
    switch(+err.code) {

    case ERR_UNIQUE_VIOLATED:
      return {status: httpStaus.BAD_REQUEST, message: 'User already exists'};

    default:
      return { status: httpStaus.INTERNAL_SERVER_ERROR, message: 'Failed due to an unknown database error' };
    }
  }
};
