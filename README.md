# IELTS 8.0 Master - Vocabulary Learning App

Ứng dụng học từ vựng IELTS hiện đại với giao diện đẹp và trải nghiệm người dùng tuyệt vời.

## 🚀 Tech Stack

Xem chi tiết tại [TECH_STACK.md](./TECH_STACK.md)

### Core Technologies
- **Next.js 16** (App Router, TypeScript)
- **React 19**
- **Tailwind CSS 4**
- **Supabase** (Database + Auth)
- **Shadcn/UI** (Component Library)

## 🎨 Theme System - Tập trung

### ⚠️ QUAN TRỌNG: Chỉ thay đổi màu ở 1 file duy nhất!

**File cấu hình theme:** `src/lib/theme-config.ts`

Xem hướng dẫn chi tiết tại [THEME_GUIDE.md](./THEME_GUIDE.md)

### Tính năng Theme
- ✅ Tất cả màu sắc được quản lý tập trung
- ✅ Không có hardcoded colors trong components
- ✅ Dễ dàng thay đổi toàn bộ màu sắc chỉ bằng 1 file
- ✅ Hỗ trợ đầy đủ Light & Dark mode
- ✅ Cards và Modals có background đậm, không trong suốt

## 📦 Cài đặt

1. **Clone repository**
```bash
git clone <repo-url>
cd ielts-master
```

2. **Cài đặt dependencies**
```bash
npm install
```

3. **Cấu hình Supabase**
- Tạo file `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

4. **Setup Database**
- Chạy SQL trong file `supabase-setup.sql` trong Supabase SQL Editor
- Xem chi tiết tại [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

5. **Chạy ứng dụng**
```bash
npm run dev
```

## 🎯 Tính năng

### Authentication
- ✅ Đăng ký / Đăng nhập với Email/Password
- ✅ Route protection tự động
- ✅ Session management

### Vocabulary Management
- ✅ Thêm / Sửa / Xóa từ vựng
- ✅ Tìm kiếm real-time
- ✅ Lọc theo Category
- ✅ Text-to-Speech (Web Speech API)
- ✅ Expandable cards với Definition & Example

### Dashboard
- ✅ Thống kê: Words learned today, Total words
- ✅ Quick Add button
- ✅ Responsive grid layout

### UI/UX
- ✅ Dark Mode hoàn chỉnh
- ✅ Responsive (Mobile-first)
- ✅ Modern, clean design
- ✅ Smooth animations

## 📁 Cấu trúc Project

```
src/
├── app/                    # Next.js App Router
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard & main app
│   └── globals.css        # Global styles & theme
├── components/
│   ├── ui/                # Shadcn UI components
│   ├── layout/            # Layout components (Navbar)
│   └── vocabulary/        # Vocabulary components
├── lib/
│   ├── supabase/          # Supabase clients
│   ├── theme-config.ts    # ⭐ THEME CONFIG (chỉ thay đổi ở đây!)
│   └── utils.ts           # Utilities
└── middleware.ts          # Route protection
```

## 🎨 Thay đổi Theme

1. Mở `src/lib/theme-config.ts`
2. Thay đổi giá trị HSL cho màu bạn muốn
3. Cập nhật `src/app/globals.css` với giá trị mới
4. Refresh browser để xem thay đổi

**KHÔNG BAO GIỜ** thay đổi màu sắc ở các file khác!

## 📝 Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Lint code
```

## 🔒 Security

- Row Level Security (RLS) enabled
- User chỉ thấy/quản lý vocabularies của chính họ
- Secure authentication với Supabase

## 📄 License

Private project
