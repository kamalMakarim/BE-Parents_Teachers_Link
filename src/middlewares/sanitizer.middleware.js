const { body, validationResult } = require('express-validator');
const xss = require('xss');
const validator = require('validator');

/**
 * Middleware to sanitize inputs for NoSQL, SQL, and XSS attacks.
 * Allows valid URLs.
 */
const sanitizerMiddleware = (req, res, next) => {
  const sanitizationRules = [
    // Validate and sanitize strings to prevent NoSQL and SQL injection
    body('*').customSanitizer((value) => {
      if (typeof value === 'string') {
        // Remove potentially dangerous NoSQL or SQL patterns
        const sanitizedValue = value.replace(/[\$|{}<>;]/g, '');
        return sanitizedValue;
      }
      return value;
    }),
    // Sanitize against XSS attacks
    body('*').customSanitizer((value) => {
      if (typeof value === 'string') {
        return xss(value);
      }
      return value;
    }),
    // Allow URLs (validated using the validator library)
    body('*').custom((value) => {
      if (typeof value === 'string' && validator.isURL(value, { require_protocol: true })) {
        return true;
      }
      return true; // Allow non-URL strings
    }),
  ];

  // Apply sanitization rules
  Promise.all(sanitizationRules.map((rule) => rule.run(req)))
    .then(() => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    })
    .catch((err) => next(err));
};

module.exports = sanitizerMiddleware;
