'use strict';

const express = require('express');
const baseHandler = require('../handlers/baseHandlers');

const baseRouter = new express.Router();

baseRouter.get('/healthcheck', baseHandler.handleHealthcheck);
baseRouter.put('/register', baseHandler.handleRegister);
baseRouter.put('/token', baseHandler.handleToken);
baseRouter.delete('/unregister', baseHandler.handleUnregister);
baseRouter.get('/key', baseHandler.handlePublicKey);

module.exports = baseRouter;
