# API Specification (Phase 1)

## Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

## Profile
- `GET /api/profile`
- `PATCH /api/profile`

## Vocabulary
- `GET /api/vocabulary` (user/admin)
- `POST /api/vocabulary` (admin)
- `PATCH /api/vocabulary/:id` (admin)
- `DELETE /api/vocabulary/:id` (admin)
- `POST /api/vocabulary/import` (admin, CSV text)

## CSV format
Headers: `word,ipa,definition,example,category,difficulty`
