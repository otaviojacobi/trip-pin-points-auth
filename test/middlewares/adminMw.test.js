'use strict';

const test = require('tape');
const httpStatus = require('http-status-codes');
const jwt = require('jsonwebtoken');
const adminMw = require('../../lib/middlewares/adminMw');
const { privateKey } = require('../../lib/keys');

test('Should fail if no auth header', t => {
  const req = { headers: {}};

  const res = {
    status: function(stat) {
      t.equals(stat, httpStatus.UNAUTHORIZED);
      return this;
    },
    send: function(result) {
      t.deepEquals(result, {status: httpStatus.UNAUTHORIZED, message: 'No authorization header was provided for admin user'});
      t.end();
    }
  };
  adminMw(req, res);
});

test('Should fail if auth header is not valid', t => {
  const req = { headers: { authorization: 'Bearer 1234'}};

  const res = {
    status: function(stat) {
      t.equals(stat, httpStatus.FORBIDDEN);
      return this;
    },
    send: function(result) {
      t.deepEquals(result, { status: httpStatus.FORBIDDEN, message: 'Bearer token is not valid' });
      t.end();
    }
  };
  adminMw(req, res);
});

test('Should fail if auth header is valid but doesnt have admin scope', t => {

  const mockedToken = jwt.sign({zid:'test', scopes:['notadmin']}, privateKey, { expiresIn: '12h', algorithm: 'RS256'});
  const req = { headers: { authorization: `Bearer ${mockedToken}`}};

  const res = {
    status: function(stat) {
      t.equals(stat, httpStatus.FORBIDDEN);
      return this;
    },
    send: function(result) {
      t.deepEquals(result, {status: httpStatus.FORBIDDEN, message: 'For admin endpoints you need correct scope'});
      t.end();
    }
  };
  adminMw(req, res);
});

test('Should call next middleware if correct sign and scopes', t => {
  const mockedToken = jwt.sign({zid:'test', scopes:['admin']}, privateKey, { expiresIn: '12h', algorithm: 'RS256'});
  const req = { headers: { authorization: `Bearer ${mockedToken}`}};

  const res = {
    status: function(stat) {
      t.equals(stat, httpStatus.FORBIDDEN);
      return this;
    },
    send: function(result) {
      t.deepEquals(result, {status: httpStatus.FORBIDDEN, message: 'For admin endpoints you need correct scope'});
    }
  };
  adminMw(req, res, () => {
    t.pass();
    t.end();
  });
});
