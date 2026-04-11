# Middlewares & Error Handling

Middlewares sit between the request and the controller. Their primary role in a production app is to sanitize inputs, enforce authentication/authorization, and handle global errors cohesively.

## 1. Global Error Handling
In standard Express, throwing an error triggers the default HTML error page. In an API, you must catch everything and emit standard JSON.

Create a specific `errorHandler.ts` middleware and mount it at the **very bottom** of `app.ts` (after all routes).

```javascript
// src/middlewares/errorHandler.js
exports.errorHandler = (err, req, res, next) => {
    console.error(err.stack); // Log it!

    // Standardize the shape
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};
```

## 2. Validation Standard (Zod)
Never trust user input. Validation should happen in a middleware layer **before** the controller executes.
We recommend using **Zod** schema validations securely wrapped in a middleware.

```javascript
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
                res.status(400).json({ success: false, errors: error.errors });
            } else {
                next(error);
            }
        }
    };
};
```

## 3. General Security Middleware
Inside `src/index.js` or `src/app.js`, always include:
- `helmet()`: Sets standard HTTP security response headers.
- `cors()`: Pre-configured to allow the exact frontend domains we develop.
- `express.json()`: Parses incoming JSON payloads and handles excessively large payload rejections (via `limit` parameters).
