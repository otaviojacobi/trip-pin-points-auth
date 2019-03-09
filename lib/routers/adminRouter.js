'use strict';

const express = require('express');
const adminHandler = require('../handlers/adminHandlers');
const adminMw = require('../middlewares/adminMw');

const adminRouter = new express.Router();
adminRouter.use(adminMw);

adminRouter.get('/users', adminHandler.handleGetUsers);
adminRouter.get('/users/:id', adminHandler.handleGetSingleUser);
adminRouter.put('/register', adminHandler.createAdmin);

module.exports = adminRouter;
