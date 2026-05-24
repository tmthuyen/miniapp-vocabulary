# IELTS 8.0 Master

## Introduction
IELTS 8.0 Master is a vocabulary-focused learning web app for IELTS learners, built with Next.js App Router and organized with clean architecture principles.  
The project currently focuses on authentication, profile management, vocabulary management, and admin operations.

## Code Architecture
The codebase is split into clear layers:

- `src/domain`: Entities, domain rules, repository contracts.
- `src/application`: Use-cases and application-level interfaces.
- `src/infrastructure`: Database adapters (Prisma/Supabase), auth, DI containers, API helpers.
- `src/app`: Next.js App Router pages and API route handlers.
- `src/components`: Shared UI and feature-level UI components.
- `src/shared`: Constants, configs, utility helpers, shared types, error mapping.

Main flow:
`UI/API Route -> Auth Guard -> Use Case -> Repository Adapter -> Database`

## Features
- Email/password sign up, login, logout.
- Cookie-based server-side session authentication.
- Role-based authorization (`user`, `admin`).
- Profile management (name, VIP plan fields).
- Vocabulary management: list, categories, create, update, delete, import.
- Vocabulary set management.
- Admin panel APIs for user and vocabulary administration.

## Set up or Start Guidline
1. Install dependencies:
```bash
npm install
```

2. Create environment file:
- Copy `.env.example` to `.env.local`.
- Fill required values (for example `DATABASE_URL`).

3. Prepare database:
- Run your Prisma migration/sync flow.
- Optional: seed data from `prisma/seed.ts`.

4. Start development server:
```bash
npm run dev
```

Default local URL: `http://localhost:3000`

## API
Base path: `/api`

### Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Profile
- `GET /api/profile`
- `PATCH /api/profile`

### Vocabulary
- `GET /api/vocabulary`
- `POST /api/vocabulary` (admin)
- `GET /api/vocabulary/:id`
- `PATCH /api/vocabulary/:id` (admin)
- `DELETE /api/vocabulary/:id` (admin)
- `GET /api/vocabulary/categories`
- `GET /api/vocabulary/sets`
- `POST /api/vocabulary/import` (admin)

### Admin
- `GET /api/admin/users`
- `POST /api/admin/users`
- `PATCH /api/admin/users/update`
- `PATCH /api/admin/users/:id`
- `DELETE /api/admin/users/:id`
- `POST /api/admin/users/:id` (action endpoint, supports `ban`)
- `GET /api/admin/vocabulary`
- `POST /api/admin/vocabulary`
- `PATCH /api/admin/vocabulary`
- `PATCH /api/admin/vocabulary/item`
- `DELETE /api/admin/vocabulary/item`
- `GET /api/admin/vocabulary/sets`
- `POST /api/admin/vocabulary/sets`
- `POST /api/admin/vocabulary/import`

For details and payload notes, see `docs/API_SPEC.md`.

## Docs
- `docs/CLEAN_ARCHITECTURE.md`
- `docs/API_SPEC.md`
- `docs/TECH_STACK.md`
- `docs/SETUP.md`
- `docs/PRODUCT_OVERVIEW.md`
- `docs/THEME_GUIDE.md`

## Tech Stack
- Next.js 16
- React 19
- TypeScript 5
- Tailwind CSS 4
- Prisma + PostgreSQL
- Vitest

## Useful Scripts
```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
npm run test:watch
```
