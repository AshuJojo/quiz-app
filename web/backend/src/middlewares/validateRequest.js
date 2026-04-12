// src/middlewares/validateRequest.js
const { ZodError } = require('zod');

exports.validateRequest = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues || error.errors || [];
        const message = issues[0]?.message || 'Validation failed';
        res.status(400).json({
          success: false,
          message,
        });
      } else {
        next(error);
      }
    }
  };
};
