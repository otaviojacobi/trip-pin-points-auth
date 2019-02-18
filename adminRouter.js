'use strict';

const express = require('express');
const httpStatus = require('http-status-codes');

const adminRouter = new express.Router();

adminRouter.get('/deployTable', (req, res) => {
  res.status(httpStatus.OK).send('Deploy !!');
});

module.exports = adminRouter;
