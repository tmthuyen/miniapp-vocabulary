# Clean Architecture Design

## Layers
- `core/domain`: entities (UserProfile, Vocabulary).
- `core/interfaces`: repository contracts.
- `core/use-cases`: business rules and orchestration.
- `infrastructure`: Supabase repositories, auth guards, DI container.
- `app/api`: HTTP handlers using use-cases.
- `app/dashboard`: UI pages and learning games.

## Authorization
- `requireUser`: requires signed-in user.
- `requireAdmin`: requires `profile.role === admin`.

## Subscription model
- Store in `profiles`: `vip_plan`, `vip_expired_at`.
- Future premium features should check plan and expiry via use-case.
