'use strict';

const test = require('tape');
const sinon = require('sinon');

const getConnectionString = require('../../lib/db/getConnectionString');

test('Should get correct connection string', t => {
  sinon.stub(process, 'env').value({
    DB_USERNAME: 'username',
    DB_PASSWORD: 'pwd',
    DB_HOST: 'host',
    DB_PORT: '4242',
    DB_NAME: 'name'
  });

  t.equals(getConnectionString(), 'postgres://username:pwd@host:4242/name');
  sinon.restore();
  t.end();
});

test('Should throw if environment variables not there', t => {
  try {
    getConnectionString();
    t.fail();
  } catch(err) {
    t.pass();
  }
  t.end();
});

