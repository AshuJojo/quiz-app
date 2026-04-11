# Production Folder Structure

A well-architected Express.js application should decouple business logic from API transport layers. 

## Directory Tree Standard

Inside `web/backend/src`, we organize code largely by technical layers, grouped cleanly. As the application grows, consider transitioning to vertical slices (Domain-Driven). For the MVP, this layer-based architecture is reliable:

```text
web/backend/
├── prisma/             # ORM models and migrations
│   └── schema.prisma
├── src/
│   ├── config/         # Environment variables & constants configuration
│   ├── controllers/    # API Request/Response handlers, grouped by resource (e.g. categoryController.js)
│   ├── middlewares/    # Custom Express middlewares (auth, errorHandler, validations)
│   ├── routes/         # Express routers (e.g. categoryRoutes.js)
│   ├── services/       # Core business logic; Controllers consume Services (e.g. categoryService.js)
│   ├── utils/          # Generic helper functions (e.g. logger.js, stringFormatters.js)
│   ├── schemas/        # Joi or Zod validation schemas for requests
│   ├── app.js          # Express App configuration (Middlewares injected here)
│   └── index.js        # Entry point (Server startup & DB Connections)
```

## Guiding Rules for Organization
1. **Never write DB syntax inside routes**: Avoid executing `prisma.*` raw inside `routes/`.
2. **Centralize Dependencies**: Use `app.js` to configure the application state and export it, leaving `index.js` purely for `app.listen()` and bootstrapping. This makes `app.js` highly testable via tools like Supertest.
3. **Keep `src/` clean**: All build configurations, linter settings, and environment files (`.env`) belong at the root of `web/backend/`.
