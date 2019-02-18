'use strict';

const test = require('tape');
const httpStatus = require('http-status-codes');
const jwt = require('jsonwebtoken');
const baseHandlers = require('../../lib/handlers/baseHandlers');
const db = require('../../lib/db');
const { privateKey } = require('../../lib/keys');

test('Should do healthcheck with db up', t => {
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

  baseHandlers.handleHealthcheck(null, res);
});

test('Should do healthcheck with db down', t => {

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
      t.deepEquals(result, { status: httpStatus.SERVICE_UNAVAILABLE, message: 'An error happened while trying to query the db' });
      t.end();
    }
  };

  baseHandlers.handleHealthcheck(null, res);
});

test('Should register user', t => {

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
      t.notEquals(result.token, undefined);
      t.end();
    }
  };

  baseHandlers.handleRegister({body: mockUserRegisterInfo}, res);
});

test('Should fail to register user without valid body', t => {

  const res = {
    status: function(stat) {
      t.equals(stat, httpStatus.BAD_REQUEST);
      return this;
    },
    send: function(result) {
      t.equals(result.token, undefined);
    }
  };

  baseHandlers.handleRegister({body: {}}, res);
  baseHandlers.handleRegister({body: {username: 'name'}}, res);
  baseHandlers.handleRegister({body: {email: 'email@test.com'}}, res);
  baseHandlers.handleRegister({body: {password: '1234'}}, res);
  baseHandlers.handleRegister({body: {password: '1234', email: 'email@test.com'}}, res);
  baseHandlers.handleRegister({body: {username: 'name', password: '1234'}}, res);
  baseHandlers.handleRegister({body: {username: 'name', email: 'email@test.com'}}, res);

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

  baseHandlers.handleRegister({body: mockUserRegisterInfo}, res);

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

  baseHandlers.handleRegister({body: mockUserRegisterInfo}, res);

});

test('Should create token if user exists', t => {
  db.setClient({
    query: async () => {
      return [{scopes: 'test,admin', zid: 'username'}];
    }
  });

  const res = {
    status: function(stat) {
      t.equals(stat, httpStatus.OK);
      return this;
    },
    send: function(result) {
      t.notEquals(result.token, undefined);
      t.end();
    }
  };

  baseHandlers.handleToken({body:{username:'username', password: 'password'}}, res);

});

test('Should return error if user was not found', t => {
  db.setClient({
    query: async () => {
      return [];
    }
  });

  const res = {
    status: function(stat) {
      t.equals(stat, httpStatus.UNAUTHORIZED);
      return this;
    },
    send: function(result) {
      t.deepEquals(result, { status: httpStatus.UNAUTHORIZED, message: 'Invalid Credentials.'});
      t.end();
    }
  };

  baseHandlers.handleToken({body:{username:'username', password: 'password'}}, res);

});

test('Should return error if database query returned error', t => {
  db.setClient({
    query: async () => {
      throw new Error('Test error');
    }
  });

  const res = {
    status: function(stat) {
      t.equals(stat, httpStatus.INTERNAL_SERVER_ERROR);
      return this;
    },
    send: function(result) {
      t.deepEquals(result, { status: httpStatus.INTERNAL_SERVER_ERROR, message: 'Failed due to an unknown database error'});
      t.end();
    }
  };

  baseHandlers.handleToken({body:{username:'username', password: 'password'}}, res);

});

test('Should unregister user', t => {
  db.setClient({
    query: async () => {
      return 0;
    }
  });

  const mockedToken = jwt.sign({zid:'test'}, privateKey, { expiresIn: '12h', algorithm: 'RS256'});
  const req = {
    headers: {
      authorization:`Bearer ${mockedToken}`
    }
  };

  const res = {
    status: function(stat) {
      t.equals(stat, httpStatus.NO_CONTENT);
      return this;
    },
    send: function(result) {
      t.equals(result, undefined);
      t.end();
    }
  };

  baseHandlers.handleUnregister(req, res);

});

test('Should try to unregister without authorization', t => {

  const res = {
    status: function(stat) {
      t.equals(stat, httpStatus.UNAUTHORIZED);
      return this;
    },
    send: function(result) {
      t.deepEquals(result, {status: httpStatus.UNAUTHORIZED, message: 'No authorization header was provided for unregister'});
      t.end();
    }
  };

  baseHandlers.handleUnregister({headers: {}}, res);

});

test('Should try to unregister user without valid token', t => {
  db.setClient({
    query: async () => {
      return 0;
    }
  });

  const req = {
    headers: {
      authorization:`Bearer 1234`
    }
  };

  const res = {
    status: function(stat) {
      t.equals(stat, httpStatus.FORBIDDEN);
      return this;
    },
    send: function(result) {
      t.deepEquals(result, {status: httpStatus.FORBIDDEN, message: 'Bearer token is not valid'});
      t.end();
    }
  };

  baseHandlers.handleUnregister(req, res);

});

test('Should try to unregister user with valid token without zid', t => {
  db.setClient({
    query: async () => {
      return 0;
    }
  });

  const mockedToken = jwt.sign({scopes:['test']}, privateKey, { expiresIn: '12h', algorithm: 'RS256'});
  const req = {
    headers: {
      authorization:`Bearer ${mockedToken}`
    }
  };

  const res = {
    status: function(stat) {
      t.equals(stat, httpStatus.BAD_REQUEST);
      return this;
    },
    send: function(result) {
      t.deepEquals(result, {status: httpStatus.BAD_REQUEST, message: 'JWT without proper Identity Zone'});
      t.end();
    }
  };

  baseHandlers.handleUnregister(req, res);

});
