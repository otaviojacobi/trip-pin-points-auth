'use strict';

const fs = require('fs');
const publicKey = fs.readFileSync('./lib/keys/public.key', 'utf8');
const privateKey = fs.readFileSync('./lib/keys/private.key', 'utf8');

module.exports = {
  publicKey,
  privateKey
};
