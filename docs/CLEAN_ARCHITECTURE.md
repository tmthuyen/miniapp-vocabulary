# Clean Architecture Design

## Layer mapping in current codebase
- `src/domain`
  - Entities: `Vocabulary`, `VocabularySet`, `UserProfile`, `Session`, `Role`, ...
  - Repository contracts: `I*Repository`.
  - Domain-level exceptions/rules.
- `src/application`
  - Use-cases grouped by module: `auth`, `profile`, `vocabulary`, `admin`.
  - Application interfaces (example: `IPasswordHasher`).
- `src/infrastructure`
  - Prisma repository adapters for production flow.
  - Supabase repositories still present for selected modules.
  - Auth implementation (`prismaAuth`) and request guards.
  - DI container (`createRequestContainer`, `createNextRouteContainer`).
- `src/app`
  - App Router UI pages and API route handlers.
  - Route handlers coordinate auth + use-case execution only.
- `src/shared`
  - Config, constants, common types, validation, and error mapping.

## Request flow
1. Route handler receives request (`src/app/api/**/route.ts`).
2. Guard checks auth/role (`requireUser`, `requireAdmin`, `requireVip`).
3. DI provides use-cases bound to repository adapters.
4. Use-case executes business logic.
5. Result mapped to JSON response (with centralized error mapping when needed).

## Authorization rules
- `requireUser`: must have valid current session cookie.
- `requireAdmin`: `requireUser` + `profile.isAdmin()`.
- `requireVip(plan)`: validates active VIP plan and expiration time.

## Data and auth notes
- Primary auth flow currently uses Prisma + cookie session (`prismaAuth`).
- `vip_plan` and `vip_expired_at` are enforced in guard/use-case layer.
- Keep business rules in use-cases/entities; avoid putting logic directly in route handlers.
