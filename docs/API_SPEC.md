# API Specification

Base path: `/api`

## Auth
- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`

## Profile
- `GET /profile` (require user)
- `PATCH /profile` (require user)

## Vocabulary (user-facing)
- `GET /vocabulary` (require user)
- `POST /vocabulary` (require admin)
- `GET /vocabulary/:id` (require user)
- `PATCH /vocabulary/:id` (require admin)
- `DELETE /vocabulary/:id` (require admin)
- `GET /vocabulary/categories` (require user)
- `GET /vocabulary/sets` (require user)
- `POST /vocabulary/import` (require admin)

## Admin - Users
- `GET /admin/users` (require admin)
- `POST /admin/users` (require admin) - create user
- `PATCH /admin/users/update` (require admin) - batch/update shortcut
- `PATCH /admin/users/:id` (require admin) - update role/vip/profile fields
- `DELETE /admin/users/:id` (require admin) - delete user
- `POST /admin/users/:id` (require admin) - action endpoint (currently supports `ban`)

## Admin - Vocabulary
- `GET /admin/vocabulary` (require admin)
- `POST /admin/vocabulary` (require admin) - create single item
- `PATCH /admin/vocabulary` (require admin) - create multiple rows
- `PATCH /admin/vocabulary/item` (require admin) - update by body id
- `DELETE /admin/vocabulary/item` (require admin) - delete by body id
- `GET /admin/vocabulary/sets` (require admin)
- `POST /admin/vocabulary/sets` (require admin)
- `POST /admin/vocabulary/import` (require admin) - modes: `preview`, `commit`

## CSV import format
Headers supported:
- `word` (required)
- `ipa`
- `definition`
- `example`
- `category`
- `difficulty` (`Easy` | `Medium` | `Hard`)
- `set_id`
