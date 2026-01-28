# Hướng dẫn chạy ứng dụng IELTS 8.0 Master

## Bước 1: Cấu hình Supabase

1. Tạo file `.env.local` trong thư mục gốc của project với nội dung:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

2. Lấy thông tin từ Supabase Dashboard:
   - Vào https://supabase.com
   - Chọn project của bạn
   - Vào Settings > API
   - Copy `Project URL` và `anon public` key

## Bước 2: Tạo Database Table

Chạy SQL sau trong Supabase SQL Editor:

```sql
CREATE TABLE vocabularies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL,
  ipa TEXT,
  definition TEXT,
  example TEXT,
  category TEXT DEFAULT 'General',
  difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')) DEFAULT 'Medium',
  created_at TIMESTAMP DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Tạo index để tối ưu query
CREATE INDEX idx_vocabularies_user_id ON vocabularies(user_id);
CREATE INDEX idx_vocabularies_created_at ON vocabularies(created_at);
```

## Bước 3: Cài đặt dependencies (nếu chưa cài)

```bash
npm install
```

## Bước 4: Chạy ứng dụng

```bash
npm run dev
```

Ứng dụng sẽ chạy tại: http://localhost:3000

## Bước 5: Sử dụng

1. Mở trình duyệt và vào http://localhost:3000
2. Tạo tài khoản mới hoặc đăng nhập
3. Bắt đầu thêm từ vựng và học tập!

