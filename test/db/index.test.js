'use strict';

const test = require('tape');
const sinon = require('sinon');
const db = require('../../lib/db');

test('Should try to create client if client is null', t => {
  db.setClient(null);
  sinon.stub(process, 'env').value({
    DB_USERNAME: 'username',
    DB_PASSWORD: 'pwd',
    DB_HOST: 'host',
    DB_PORT: '4242',
    DB_NAME: 'name'
  });
  const client = db.getClient();

  t.notEquals(client, undefined);
  t.end();

});
