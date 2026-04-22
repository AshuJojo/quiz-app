# Services & Data Layer

The `services/` directory is the beating heart of your application. This is where business logic, orchestrations, and database transactions lie.

## Principles of a Service

1. **Framework Agnostic**: A service function should ideally NOT know anything about `req` or `res` objects. It takes in raw data types (`string`, `number`, specific object definitions) and returns data or throws customized Errors.
   - _Why?_ This makes the service highly reusable. You could theoretically call `createCategory(name)` from a Cron Job script, a Web Socket event, or an Express REST Router without rewriting the code.
2. **Database Interaction**: This layer handles interactions with the Prisma ORM. Complex algorithmic steps go here.
3. **Transaction Boundaries**: If a service needs to create a `Paper` and subsequently link 20 `Questions` to it, the service function should wrap this in a database transaction (`prisma.$transaction`) to ensure atomicity.

**Good Pattern (`src/services/categoryService.js`):**

```javascript
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Note: No Express context here! Pure business logic.
exports.buildCategoryTree = async (name, parentId) => {
  // 1. Validation Logic
  if (parentId) {
    const parentExists = await prisma.category.findUnique({ where: { id: parentId } });
    if (!parentExists) {
      // Throwing an error string or custom Error class.
      // A custom AppError class is preferred.
      throw new Error('Parent category does not exist');
    }
  }

  // 2. Database interaction
  const category = await prisma.category.create({
    data: {
      name,
      parentId: parentId || null,
    },
  });

  return category;
};
```
