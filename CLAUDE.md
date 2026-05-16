# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Homestay booking website (Vietnamese market) — chain of 20+ rooms across 5+ branches, with hourly/daily booking, VNPay payment, and bilingual (VI/EN) UI. See `docs/PRD.md` for full product spec.

Two separate applications:
- **Backend**: `src/backend/` — NestJS 11 + Prisma 7 + PostgreSQL + Redis (port **4000**)
- **Frontend**: `src/frontend/` — Next.js 16 + NextAuth v5 + Tailwind v4 + shadcn/ui (port **3000**)

## Commands

### Infrastructure (at repo root)
```bash
docker compose up -d   # Start PostgreSQL (5432) + Redis (6379)
docker compose down    # Stop services
```

### Backend (`src/backend/`) — package manager: npm
```bash
npm run start:dev                              # Start with hot reload (port 4000)
npm run build && npm run start:prod
npm test                                       # All unit tests (Jest)
npm test -- --testPathPattern=users.service    # Single test file
npm run test:cov                               # Coverage report
npm run test:e2e                               # E2E tests
npx prisma migrate dev --name <description>    # Run migration after schema change
npx prisma studio                              # Open Prisma Studio
npm run lint                                   # ESLint --fix
```

### Frontend (`src/frontend/`) — package manager: pnpm
```bash
pnpm dev     # Start dev server (port 3000)
pnpm build   # Production build
pnpm lint    # ESLint
```

## Backend Architecture — Clean Architecture per module

### Module file structure (mandatory for every new feature)

```
src/modules/<name>/
├── <name>.module.ts
├── application/
│   └── <name>.service.ts          # business logic only — no direct DB calls
├── infrastructure/
│   └── <name>.repository.ts       # extends BaseRepository, inject prisma.<model>
├── interface/
│   ├── <name>.controller.ts       # @ApiTags, @ApiBearerAuth, HTTP mapping
│   └── dto/
│       ├── create-<name>.dto.ts
│       ├── update-<name>.dto.ts   # PartialType(Create<Name>Dto)
│       └── <name>-query.dto.ts    # extends PaginationDto
```

### Key conventions

**Global guards/interceptors applied to every route automatically:**
- `JwtAuthGuard` — use `@Public()` to opt out (login, register, refresh, public GETs)
- `RolesGuard` — use `@Roles(Role.ADMIN)` for admin-only endpoints
- `ThrottlerGuard` — configured via `THROTTLE_TTL` / `THROTTLE_LIMIT` env vars
- `TransformInterceptor` — controllers return `{ message: '...', data }` and the interceptor wraps it as `{ success, statusCode, timestamp, path, message, data, errors }`

**`BaseRepository` pattern:**
```typescript
// Repository constructor
constructor(prisma: PrismaService) {
  super(prisma, prisma.user as any);
}

// Define a typed select object on the repository class
readonly userSelect: Prisma.UserSelect = { id: true, email: true, ... };

// Call it from the service
this.repository.findAll({ where, select: this.repository.userSelect });
```
Use `softRemove({ id })` for user-facing deletes. Always filter `deletedAt: null` in service `findAll`/`findOne` calls.

**Prisma schema conventions:**
- Every model has: `id String @id @default(uuid())`, `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt`, `deletedAt DateTime?`
- Enums go above the models that use them

**Cache key conventions:**
- Single entity: `<model>_<id>` (e.g. `user_abc123`)
- List queries: `<model>s_list_${JSON.stringify(query)}`
- Invalidate on every write: delete individual key + all tracked list keys (see `ProductsService` for the pattern using a `Set<string>` to track list keys)

**DTO conventions:**
- Always use `class-validator` + `class-transformer`
- Add `@ApiProperty` / `@ApiPropertyOptional` to every field for Swagger
- Query DTOs extend `PaginationDto` from `src/common/dto/pagination.dto.ts`

**Existing modules:** `AuthModule`, `UsersModule`, `ProductsModule`

**API:** `http://localhost:4000/api/v1` | Swagger: `http://localhost:4000/api/docs`

**Auth tokens:**
- Access token: 15m TTL (`JWT_SECRET` / `JWT_EXPIRATION`)
- Refresh token: 7d TTL (`JWT_REFRESH_SECRET` / `JWT_REFRESH_EXPIRATION`) — `POST /api/v1/auth/refresh`

## Frontend Architecture — Next.js App Router

**Route groups:**
- `(marketing)/` — public pages (home, about, contact)
- `(auth)/` — login / register
- `cms/` — protected admin dashboard

**Auth flow:** NextAuth v5 (`src/lib/auth.ts`) calls `POST /api/v1/auth/login`. Access token (14-min window) and refresh token are stored in the JWT session and auto-refreshed before expiry.

**HTTP client:** Use `src/lib/api.ts` for all backend calls — it handles `Authorization: Bearer` headers and throws `ApiError` on non-2xx.

**Forms:** Use `react-hook-form` + `zod` + `@hookform/resolvers/zod`. See `src/components/cms/PostForm.tsx` for the reference pattern.

**CMS routes:** Add `error.tsx` + `loading.tsx` to every new CMS route (existing ones at `src/app/cms/`).

**UI components:** shadcn/ui lives in `src/components/ui/`. Custom components go in `cms/`, `marketing/`, or `shared/` subdirectories.

**Posts (temporary):** `src/app/api/posts/` is a local Next.js route backed by the in-memory `src/lib/posts-store.ts`. When the backend `PostsModule` is ready, update those handlers to proxy to `${NEXT_PUBLIC_API_URL}/api/v1/posts`.

## Environment

### Backend (`src/backend/.env`)
Required: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `REDIS_HOST`

Optional with defaults: `PORT=4000`, `REDIS_PORT=6379`, `JWT_EXPIRATION=15m`, `JWT_REFRESH_EXPIRATION=7d`, `THROTTLE_TTL=60000`, `THROTTLE_LIMIT=100`, `CORS_ORIGIN=http://localhost:3000`, `PRODUCT_CACHE_TTL=60000`

### Frontend (`src/frontend/.env`)
Required: `AUTH_SECRET`, `NEXT_PUBLIC_API_URL=http://localhost:4000`

## Breaking changes to be aware of
- **Next.js 16**: May differ from training data. Read `node_modules/next/dist/docs/` before writing Next.js-specific code.
- **Tailwind CSS v4**: Configured entirely via `src/app/globals.css` — no `tailwind.config.js`.
- **Prisma 7**: Uses `@prisma/adapter-pg` with connection pooling in `PrismaService`.
