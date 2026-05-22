# IELTS 8.0 Master

Ứng dụng web học từ vựng IELTS theo hướng clean architecture. Dự án hiện tập trung vào 4 phần chính: đăng nhập/đăng ký, quản lý từ vựng, hồ sơ người dùng và các game luyện tập.

## Dự án này làm gì?

- Đăng ký, đăng nhập, đăng xuất bằng email/password.
- Phân quyền `user` và `admin`.
- Quản lý từ vựng: xem, thêm, sửa, xóa, import CSV.
- Quản lý hồ sơ cá nhân: tên, avatar, band mục tiêu, VIP plan.
- Chơi game học từ vựng: flashcard, quiz, fill, matching.
- Theo dõi lịch sử game và trạng thái VIP.

## Kiến trúc ngắn gọn

Dự án được tách theo các lớp rõ ràng:

- `src/app`: giao diện và API routes của Next.js.
- `src/presentation`: component theo feature, dùng cho UI.
- `src/core`: domain, interface repository, use-case.
- `src/infrastructure`: Prisma, auth, DI container, guard request.
- `src/shared`: route constants, theme config, utils, types.
- `prisma`: schema và seed dữ liệu.
- `docs`: tài liệu kiến trúc, API, setup, theme.

Luồng chung là: UI hoặc API route -> auth guard -> use-case -> repository -> database.

## Công nghệ chính

- Next.js 16 với App Router.
- React 19 và TypeScript.
- Tailwind CSS 4.
- Prisma + PostgreSQL.
- Custom session auth bằng cookie.
- Radix UI, Lucide React, next-themes.

Xem thêm: [TECH_STACK.md](./docs/TECH_STACK.md)

## Cấu trúc thư mục chính

```text
src/
├── app/                  # Pages và API routes
│   ├── auth/             # Login, signup
│   ├── dashboard/        # Dashboard, games, profile, admin pages
│   └── api/              # API handlers
├── components/           # UI dùng chung
├── core/                 # Domain + use-case + repository interfaces
├── infrastructure/       # Prisma, auth, DI, API helpers
├── presentation/         # Component theo feature
└── shared/               # Config, routes, utils, types

prisma/
├── schema.prisma         # Data model
└── seed.ts               # Seed data

docs/                     # Tài liệu dự án
```

## Các luồng hoạt động chính

### 1. Vào ứng dụng

- Trang gốc kiểm tra user hiện tại.
- Nếu đã đăng nhập, chuyển sang `/dashboard`.
- Nếu chưa đăng nhập, chuyển sang `/auth/login`.

### 2. Đăng nhập

- Form login gọi `POST /api/auth/login`.
- API kiểm tra email/password.
- Nếu đúng, hệ thống tạo session token và lưu vào cookie.
- Sau đó app tải lại để middleware nhận session mới.

### 3. Xem dashboard

- Dashboard gọi `GET /api/auth/me` để lấy user hiện tại.
- Sau đó gọi `GET /api/vocabulary` để lấy danh sách từ vựng.
- UI hiển thị thống kê và danh sách từ vựng.

### 4. Quản lý từ vựng

- User thường chỉ được xem dữ liệu của chính mình.
- Admin mới được tạo/sửa/xóa/import từ vựng.
- Logic nghiệp vụ nằm trong `core/use-cases`, không nằm trực tiếp trong route.

### 5. Chơi game

- Game page lấy danh sách từ vựng trước.
- Khi bắt đầu game, API tạo `GameSession`.
- Mỗi câu trả lời được lưu thành `GameAnswer`.
- Khi kết thúc, session được đánh dấu hoàn tất và cập nhật điểm.

## Nguyên tắc thiết kế

- Business logic nằm trong `src/core`.
- API route chỉ làm nhiệm vụ nhận request và trả response.
- Repository chịu trách nhiệm đọc/ghi database.
- Guard như `requireUser`, `requireAdmin`, `requireVip` kiểm tra quyền trước khi đi vào use-case.
- Entity có kiểm tra dữ liệu đầu vào để tránh trạng thái sai.
- Theme được quản lý tập trung, không hardcode màu rải rác trong component.

## Theme và màu sắc

Theme hiện được quản lý tập trung ở:

- [src/shared/config/theme-config.ts](./src/shared/config/theme-config.ts)
- [src/app/globals.css](./src/app/globals.css)

Nếu muốn đổi màu, hãy sửa theme config trước rồi đồng bộ sang `globals.css`.

## Cài đặt và chạy dự án

### 1. Cài dependency

```bash
npm install
```

### 2. Tạo file môi trường

Tạo `.env.local` ở thư mục gốc, tối thiểu cần:

```bash
DATABASE_URL="postgresql://postgres:123456@localhost:5432/ielts_master?schema=public"
```

Nếu bạn dùng các module Supabase có sẵn trong project, thêm:

```bash
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
```

Mẫu đầy đủ có thể xem trong [.env.example](./.env.example).

### 3. Chuẩn bị database

- Tạo database PostgreSQL phù hợp với `DATABASE_URL`.
- Chạy Prisma migration hoặc sync schema theo quy trình của bạn.
- Nếu cần dữ liệu mẫu, dùng `prisma/seed.ts`.

### 4. Chạy app

```bash
npm run dev
```

Mở `http://localhost:3000`.

## Scripts hữu ích

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
```

## Tài liệu liên quan

- [PRODUCT_OVERVIEW.md](./docs/PRODUCT_OVERVIEW.md)
- [CLEAN_ARCHITECTURE.md](./docs/CLEAN_ARCHITECTURE.md)
- [API_SPEC.md](./docs/API_SPEC.md)
- [SETUP.md](./docs/SETUP.md)
- [THEME_GUIDE.md](./docs/THEME_GUIDE.md)

## Ghi chú

- Đây là project riêng tư.
- Một số file Supabase vẫn còn trong source để hỗ trợ các module liên quan, nhưng luồng auth chính hiện dùng Prisma + cookie session.
