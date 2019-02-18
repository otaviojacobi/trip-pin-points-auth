'use strict';

const pg = require('pg-promise')();
const getConnectionString = require('./getConnectionString');

let postgresClient = null;
module.exports = {
  getClient: () => {
    if(!postgresClient) {
      postgresClient = pg(getConnectionString());
    }
    return postgresClient;
  },
  setClient: newClient => {
    postgresClient = newClient;
  }
};
