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

test('Should register admin', t => {

  const mockUserRegisterInfo = {
    username: 'test',
    email: 'test@email.com',
    password: 'testpwd'
  };

  db.setClient({
    query: async () => {
      return [{scopes: 'test,admin', zid: mockUserRegisterInfo.username}];
    }
  });

  const res = {
    status: function(stat) {
      t.equals(stat, httpStatus.CREATED);
      return this;
    },
    send: function(result) {
      t.equals(result.status, 'created');
      t.end();
    }
  };

  adminHandlers.createAdmin({body: mockUserRegisterInfo}, res);
});

test('Should fail to register admin without valid body', t => {

  const res = {
    status: function(stat) {
      t.equals(stat, httpStatus.BAD_REQUEST);
      return this;
    },
    send: function(result) {
      t.equals(result.token, undefined);
    }
  };

  adminHandlers.createAdmin({body: {}}, res);
  adminHandlers.createAdmin({body: {username: 'name'}}, res);
  adminHandlers.createAdmin({body: {email: 'email@test.com'}}, res);
  adminHandlers.createAdmin({body: {password: '1234'}}, res);
  adminHandlers.createAdmin({body: {password: '1234', email: 'email@test.com'}}, res);
  adminHandlers.createAdmin({body: {username: 'name', password: '1234'}}, res);
  adminHandlers.createAdmin({body: {username: 'name', email: 'email@test.com'}}, res);

  t.end();
});

test('Should return error if databse returns known error', t => {

  const mockUserRegisterInfo = {
    username: 'test',
    email: 'test@email.com',
    password: 'testpwd'
  };

  const res = {
    status: function(stat) {
      t.equals(stat, httpStatus.BAD_REQUEST);
      return this;
    },
    send: function(result) {
      t.equals(result.message, 'User already exists');
      t.end();
    }
  };

  db.setClient({
    query: async () => {
      throw {code: 23505};
    }
  });

  adminHandlers.createAdmin({body: mockUserRegisterInfo}, res);

});

test('Should return error if databse returns unknown error', t => {

  const mockUserRegisterInfo = {
    username: 'test',
    email: 'test@email.com',
    password: 'testpwd'
  };

  const res = {
    status: function(stat) {
      t.equals(stat, httpStatus.INTERNAL_SERVER_ERROR);
      return this;
    },
    send: function(result) {
      t.equals(result.message, 'Failed due to an unknown database error');
      t.end();
    }
  };

  db.setClient({
    query: async () => {
      throw {code: 4242424242};
    }
  });

  adminHandlers.createAdmin({body: mockUserRegisterInfo}, res);

});
