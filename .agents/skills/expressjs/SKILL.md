# Express.js Production Architecture Skill

This skill defines the standards, modularity, and code organization principles to be used when building the production-grade Express.js backend for this project.

As an AI agent, you must strictly follow this architecture and pattern when scaffolding new API features. The goal is to enforce Separation of Concerns (SoC), making the backend testable, scalable, and easy to maintain.

## Related Documentation 

To fully understand the organization, review the sub-documents in the following order:

1. **[Folder Structure & Domain Organization](file:///d:/quiz-app/.agents/skills/expressjs/structure.md)**
   Understand the high-level skeleton, where files live, and how domains (features) are grouped.
2. **[Routing & Controllers](file:///d:/quiz-app/.agents/skills/expressjs/routing_controllers.md)**
   How HTTP requests are mapped to controllers and how controllers should remain thin.
3. **[Services & Data Layer](file:///d:/quiz-app/.agents/skills/expressjs/services_models.md)**
   Where the actual business logic executes and how it interacts with Prisma ORM.
4. **[Middlewares & Error Handling](file:///d:/quiz-app/.agents/skills/expressjs/middlewares.md)**
   How validation, global error catching, and authentication are uniformly implemented.

## Core Philosophical Principles
- **Thin Controllers, Fat Services**: Controllers only handle HTTP logic (req/res, status codes). All complex logic and database interactions must be passed down to Services.
- **Domain-Driven Design (Lite)**: Group related elements by feature (e.g., `categories/`, `papers/`) rather than by technical role (don't dump all controllers in one giant folder if the app becomes large, although a simple MVC structure is fine for MVP until it scales).
- **Fail Fast, Handle Globally**: Unhandled promises/errors in controllers should be caught and deferred to a global Error Handling Express Middleware.
