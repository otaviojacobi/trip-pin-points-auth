'use strict';

const express = require('express');
const httpStatus = require('http-status-codes');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const db = require('./db');

const adminRouter = new express.Router();

const publicKey = fs.readFileSync('./public.key', 'utf8');

adminRouter.use((req, res, next) => {

  if(!req.headers.authorization) {
    return res.status(httpStatus.UNAUTHORIZED).send({status: httpStatus.UNAUTHORIZED, message: 'No authorization header was provided for admin user'});
  }
  const bearerHeader = req.headers.authorization.replace('Bearer ', '');

  jwt.verify(bearerHeader, publicKey, { algorithms: ['RS256'] }, (err, decoded) => {
    if(err) {
      console.error(err);
      return res.status(httpStatus.FORBIDDEN).send({status: httpStatus.FORBIDDEN, message: 'Bearer token is not valid'});
    }
    if(!decoded.scopes.find(scope => scope === 'admin')) {
      return res.status(httpStatus.FORBIDDEN).send({status: httpStatus.FORBIDDEN, message: 'For admin endpoints you need correct scope '});
    }
    next();
  });
});

adminRouter.get('/deployTable', async (req, res) => {
  const client = db.getClient();
  try {
    const createResult = await client.query(`
    CREATE EXTENSION pgcrypto;
    CREATE TABLE IF NOT EXISTS users 
      (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        scopes TEXT NOT NULL,
        password TEXT NOT NULL
      );
    `);
    res.status(httpStatus.OK).send(createResult);
  } catch(err) {
    res.status(httpStatus.SERVICE_UNAVAILABLE).send({status: httpStatus.SERVICE_UNAVAILABLE, message: err.toString()});
  }
});

module.exports = adminRouter;
