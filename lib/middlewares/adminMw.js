const httpStatus = require('http-status-codes');
const jwt = require('jsonwebtoken');
const { publicKey } = require('../keys');

function adminMw(req, res, next) {

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
}

module.exports = adminMw;