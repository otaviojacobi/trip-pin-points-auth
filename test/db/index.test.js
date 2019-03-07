'use strict';

const test = require('tape');
const sinon = require('sinon');
const db = require('../../lib/db');

test('Should try to create client if client is null', t => {
  db.setClient(null);
  sinon.stub(process, 'env').value({
    RDS_USERNAME: 'username',
    RDS_PASSWORD: 'pwd',
    RDS_HOSTNAME: 'host',
    RDS_PORT: '4242',
    RDS_DB_NAME: 'name'
  });
  const client = db.getClient();

  t.notEquals(client, undefined);
  t.end();

});
