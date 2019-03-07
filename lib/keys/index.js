'use strict';

const fs = require('fs');
const keypair = require('keypair');

if(!fs.existsSync('./lib/keys/private.key') || !fs.existsSync('./lib/keys/public.key')) {
  const pair = keypair();
  fs.writeFileSync('./lib/keys/private.key', pair.private);
  fs.writeFileSync('./lib/keys/public.key', pair.public);
}

const publicKey = fs.readFileSync('./lib/keys/public.key', 'utf8');
const privateKey = fs.readFileSync('./lib/keys/private.key', 'utf8');

module.exports = {
  publicKey,
  privateKey
};
