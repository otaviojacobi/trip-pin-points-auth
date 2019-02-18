'use strict';

const express = require('express');
const adminHandler = require('../handlers/adminHandlers');
const adminMw = require('../middlewares/adminMw');

const adminRouter = new express.Router();
adminRouter.use(adminMw);

adminRouter.get('/deployTable', adminHandler.handleDeployTable);
adminRouter.get('/users', adminHandler.handleGetUsers);
adminRouter.get('/users/:id', adminHandler.handleGetSingleUser);

module.exports = adminRouter;
