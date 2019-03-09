'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');
const app = express();

const adminRouter = require('./routers/adminRouter');
const baseRouter = require('./routers/baseRouter');

const client = db.getClient();
client.query(`
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS users 
  (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    scopes TEXT NOT NULL,
    password TEXT NOT NULL
  );
`)
  .then(() => {
    app.use(bodyParser.json());
    app.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
      next();
    });
    app.use('/', baseRouter);
    app.use('/admin', adminRouter);

    const PORT = process.env.PORT || 8081;

    app.listen(PORT, () => {
      console.log(`Application listening on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error(err);
  });
