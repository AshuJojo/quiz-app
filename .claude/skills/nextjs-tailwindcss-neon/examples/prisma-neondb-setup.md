# Example: Prisma + NeonDB Setup

Boilerplate for connecting Prisma ORM to a NeonDB (serverless Postgres) database in a Next.js `src/` project.

## `src/lib/db.ts` — Prisma Client Singleton

Prevents multiple Prisma instances during hot reload in development:

```ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
```

## `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")   // Pooled via PgBouncer — use for all app queries
  directUrl = env("DIRECT_URL")     // Direct connection — required for prisma migrate
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  posts     Post[]

  @@index([email])
}

model Post {
  id          String    @id @default(cuid())
  title       String
  slug        String    @unique
  content     String?
  published   Boolean   @default(false)
  publishedAt DateTime?
  author      User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  authorId    String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([authorId])
  @@index([slug])
}

enum Role {
  USER
  ADMIN
}
```

## `.env.local`

```bash
# NeonDB — copy both strings from NeonDB dashboard → Connection Details
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/mydb?sslmode=require&pgbouncer=true&connect_timeout=15"
DIRECT_URL="postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/mydb?sslmode=require"

# Auth
AUTH_SECRET="generate-with: openssl rand -base64 32"
AUTH_URL="http://localhost:3000"

# Public (exposed to browser)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="My App"
```

> **Why two URLs?** NeonDB uses PgBouncer for pooling (`DATABASE_URL`). Prisma migrations need a direct connection (`DIRECT_URL`) because PgBouncer doesn't support all Postgres features used during migrations.
