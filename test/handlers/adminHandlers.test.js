'use strict';

const test = require('tape');
const httpStatus = require('http-status-codes');
const adminHandlers = require('../../lib/handlers/adminHandlers');
const db = require('../../lib/db');

test('Should get single user', t => {
  const testDbAnswer = [{
    row: '(3,pedrinho,oi@test.com,user,admin)'
  }];
  const testExpectedResponse = {
    id: 3,
    username: 'pedrinho',
    email: 'oi@test.com',
    scopes: ['user', 'admin']
  };

  db.setClient({
    query: async () => {
      return testDbAnswer;
    }
  });

  const res = {
    status: function(stat) {
      t.equals(stat, httpStatus.OK);
      return this;
    },
    send: function(result) {
      t.deepEquals(result, testExpectedResponse);
      t.end();
    }
  };

  adminHandlers.handleGetSingleUser({params: {id: 42}}, res);
});

test('Should get all users', t => {

  const testDbAnswer = [
    {row: '(3,pedrinho,oi@test.com,user,admin)'},
    {row: '(1,get,oi2@test.com,user)'}
  ];

  const testExpectedResponse = [
    {id: 3, username: 'pedrinho', email: 'oi@test.com', scopes: ['user', 'admin']},
    { id: 1, username: 'get', email: 'oi2@test.com', scopes: [ 'user' ] }
  ];

  db.setClient({
    query: async () => {
      return testDbAnswer;
    }
  });

  const res = {
    status: function(stat) {
      t.equals(stat, httpStatus.OK);
      return this;
    },
    send: function(result) {
      t.deepEquals(result, testExpectedResponse);
      t.end();
    }
  };

  adminHandlers.handleGetUsers(null, res);
});

test('Should redeploy db tables', t => {
  db.setClient({
    query: async () => {
      return 'OK';
    }
  });

  const res = {
    status: function(stat) {
      t.equals(stat, httpStatus.OK);
      return this;
    },
    send: function(result) {
      t.deepEquals(result, 'OK');
      t.end();
    }
  };

  adminHandlers.handleDeployTable(null, res);
});

test('Should return error if failed to connect to database', t => {

  const testError = new Error('Expected test error');
  db.setClient({
    query: async () => {
      throw testError;
    }
  });

  const res = {
    status: function(stat) {
      t.equals(stat, httpStatus.SERVICE_UNAVAILABLE);
      return this;
    },
    send: function(result) {
      t.deepEquals(result, { status: httpStatus.SERVICE_UNAVAILABLE, message: testError.toString() });
      t.end();
    }
  };

  adminHandlers.handleDeployTable(null, res);
});
