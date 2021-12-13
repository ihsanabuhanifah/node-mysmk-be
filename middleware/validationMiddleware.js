const { validationResult } = require("express-validator");

function validationMiddleware(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.mapped() });
  }
  return next()
}

module.exports = validationMiddleware;
