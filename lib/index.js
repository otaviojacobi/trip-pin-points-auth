'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');
const app = express();

const adminRouter = require('./routers/adminRouter');
const baseRouter = require('./routers/baseRouter');

const client = db.getClient();
client.query(`
CREATE EXTENSION pgcrypto;
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
    app.use(cors());
    app.use(bodyParser.json());
    app.use('/', baseRouter);
    app.use('/admin', adminRouter);

    const PORT = process.env.PORT || 3001;

    app.listen(PORT, () => {
      console.log(`Application listening on port ${PORT}`);
    });
  })
  .catch(err => {
    console.err(err);
  });
