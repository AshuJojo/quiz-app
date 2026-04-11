# Routing & Controllers

The responsibility of the routing layer and controllers is strictly HTTP transport protocol management. 

## Routing (`src/routes/`)
Routes should map an endpoint URI to a specific controller function. Avoid defining inline functions within the routes file.

**Good Pattern:**
```javascript
// src/routes/categoryRoutes.js
const { Router } = require('express');
const categoryController = require('../controllers/categoryController');
const { validateRequest } = require('../middlewares/validateRequest');
const { createCategorySchema } = require('../schemas/categorySchema');

const router = Router();

// Notice: No logic here. Just mapping method + path + validation -> Controller
router.post('/', validateRequest(createCategorySchema), categoryController.createCategory);
router.get('/', categoryController.getCategories);

module.exports = router;
```

## Controllers (`src/controllers/`)
Controllers handle extracting data from `req` (params, body, query), invoking a Service to do the actual work, and shaping the `res` response code and JSON payload.

**Rules for Controllers:**
1. **No Database Logic**: A controller should never invoke `prisma` directly.
2. **Error Wrapping**: To avoid `try/catch` hell in every controller, wrap asynchronous controllers in a higher-order function (often called `catchAsync`) that forwards unhandled promise rejections to the Express `next()` function natively.
3. **HTTP Semantics**: Responsibilities include sending `201 Created` for POST, `200 OK` for GET, and setting proper JSON envelopes.

**Good Pattern:**
```javascript
const categoryService = require('../services/categoryService');

exports.createCategory = async (req, res, next) => {
    try {
        const { name, parentId } = req.body;
        
        // Pass to standard service
        const category = await categoryService.buildCategoryTree(name, parentId);
        
        // Return structured JSON
        res.status(201).json({
            success: true,
            data: category
        });
    } catch (error) {
        next(error); // Defer to global error handler middleware
    }
};
```
