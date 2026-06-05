**Tổng Quan Bắt Lỗi**

Mục tiêu: quy ước kiểu lỗi, vị trí ném lỗi và cách map lỗi từ Domain → UseCase → Infrastructure → Controller để trả HTTP response nhất quán và an toàn.

**Các Lớp Lỗi (types)**

- `DomainError` (tầng Domain / UseCase)
  - Dùng cho các lỗi liên quan đến nghiệp vụ/validate: `Validation`, `Business`, `NotFound`, `Forbidden`.
  - Trường: `message`, `type`, `meta?`.
  - Khi ném: cung cấp thông tin đủ cho developer, không xuất trực tiếp raw ra client.

- `InfrastructureError` (tầng Adapter / DB / 3rd-party)
  - Dùng để bọc lỗi từ DB, cache, 3rd-party (Prisma, Supabase, Redis, v.v.).
  - Trường: `message`, `code?`, `cause?`.
  - Adapter nên chuyển lỗi thô (ví dụ Prisma `P2002`) sang `InfrastructureError` với `code` rõ ràng.

- `AppError` (lỗi đã chuẩn hóa để trả HTTP tại rìa)
  - Dùng trong controller/wrapper để trả `status`, `publicMessage` cho client.
  - Signature gợi ý: `new AppError(message, code = 'APP_ERROR', status = 500, details?, publicMessage?)`.

**Quy ước ném / xử lý lỗi theo tầng**

- Domain / Use-case
  - Kiểm tra dữ liệu & nghiệp vụ, nếu không thỏa thì `throw new DomainError('...', 'Validation'|'Business'|...)`.
  - Không nắm bắt lỗi infra ở đây; nếu cần map, rethrow sang `AppError` khi muốn kiểm soát status.

- Infrastructure / Adapter
  - Bọc lỗi thư viện/DB: ví dụ với Prisma, bắt lỗi `Prisma.PrismaClientKnownRequestError` và `throw new InfrastructureError(err.message, err.code, err)`.

- Use-case khi gọi adapter
  - Nếu adapter ném `InfrastructureError`, có thể map thành `DomainError`/`AppError` tùy ngữ cảnh (ví dụ unique constraint → domain conflict → throw `AppError` với 409 hoặc `DomainError('...', 'Business')` tùy ý).

- Controller / Route
  - Không catch từng lỗi nhỏ; thay vào đó bọc handler bằng `withErrorHandling(handler)`.
  - `withErrorHandling` gọi `mapToAppError(err)` rồi trả `Response` với `status` và `publicMessage`.

**Map lỗi (mapToAppError)**

Mục tiêu: tập trung quy tắc chuyển các loại lỗi sang `AppError` để controller chỉ trả `AppError`.

- Nếu `err instanceof AppError` → return err
- Nếu `err instanceof DomainError`:
  - `Validation` → 400
  - `NotFound` → 404
  - `Forbidden` → 403
  - `Business` → 422
- Nếu `err instanceof InfrastructureError`:
  - `code === 'P2002'` or `UNIQUE_CONSTRAINT` → 409
  - else → 502
- Nếu `err` là Prisma known error object (has `.code`) → map tương tự
- Default → 500

File tham chiếu trong repo:
- map logic hiện tại: [src/shared/errorMapper.ts](src/shared/errorMapper.ts)

**Wrapper cho route (ví dụ Next.js App Router)**

Tạo 1 hàm wrapper `withErrorHandling(handler)` để bọc mọi route handler. Ví dụ:

```ts
// src/infrastructure/api/next/withErrorHandling.ts
export function withErrorHandling(handler) {
  return async (req) => {
    try {
      return await handler(req)
    } catch (err) {
      const appErr = mapToAppError(err)
      // log appErr, context, request id ...
      return NextResponse.json({ message: appErr.publicMessage ?? appErr.message, code: appErr.code }, { status: appErr.status })
    }
  }
}
```

Ví dụ dùng: tại route signup đã đổi thành `export const POST = withErrorHandling(async (req) => { ... })`.

**Gợi ý implement ở adapters (Prisma example)**

```ts
try {
  await prisma.user.create(...)
} catch (e) {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    throw new InfrastructureError(e.message, e.code, e)
  }
  throw e
}
```

**Best practices**

- Logging: log toàn bộ lỗi (stack, code, context) phía server; chỉ trả `publicMessage` cho client.
- Tránh leak thông tin nhạy cảm (SQL, stack traces) vào `publicMessage`.
- Sử dụng `error.code` để dễ phân loại và theo dõi telemetry.
- Tests: viết unit tests cho mapToAppError, đảm bảo mapping đúng status và message.

**Checklist khi chuyển code cũ**

1. Thêm `DomainError`/`InfrastructureError`/`AppError` vào project (đã có tại `src/shared/errors`).
2. Thêm `mapToAppError` (đã có `src/shared/errorMapper.ts`).
3. Thêm `withErrorHandling` và bọc tất cả route handlers.
4. Cập nhật adapter (Prisma, Supabase, v.v.) để throw `InfrastructureError` khi phù hợp.
5. Trong use-cases, thay các `throw new Error(...)` bằng `DomainError` hoặc `AppError` khi cần status cụ thể.
6. Thêm logging + process handlers `unhandledRejection`/`uncaughtException`.

File tài liệu này: [docs/ERROR_HANDLING.md](docs/ERROR_HANDLING.md)

Nếu bạn muốn, mình có thể:
- tự động bọc tất cả route handler còn lại bằng `withErrorHandling` (mình có thể patch),
- hoặc chuyển 1 adapter (ví dụ Prisma User creation) sang ném `InfrastructureError` làm mẫu.
