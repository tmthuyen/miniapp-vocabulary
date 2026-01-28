# Hướng dẫn Setup Supabase Database

## Bước 1: Tạo Table và Policies

1. Đăng nhập vào Supabase Dashboard: https://supabase.com
2. Chọn project của bạn
3. Vào **SQL Editor** (ở sidebar bên trái)
4. Click **New Query**
5. Copy toàn bộ nội dung từ file `supabase-setup.sql` và paste vào editor
6. Click **Run** (hoặc nhấn Ctrl+Enter)

## Bước 2: Kiểm tra Table đã được tạo

1. Vào **Table Editor** (ở sidebar)
2. Bạn sẽ thấy table `vocabularies` trong danh sách
3. Click vào table để xem cấu trúc

## Bước 3: Kiểm tra RLS Policies

1. Vào **Authentication** > **Policies** (hoặc vào table `vocabularies` > **Policies**)
2. Bạn sẽ thấy 4 policies:
   - Users can view own vocabularies
   - Users can insert own vocabularies
   - Users can update own vocabularies
   - Users can delete own vocabularies

## Lưu ý quan trọng:

- **Row Level Security (RLS)** đã được bật để đảm bảo mỗi user chỉ thấy và quản lý vocabularies của chính họ
- Nếu bạn gặp lỗi khi chạy SQL, có thể do:
  - Chưa có user nào trong `auth.users` (cần đăng ký ít nhất 1 user trước)
  - Hoặc cần refresh lại schema cache

## Nếu vẫn gặp lỗi:

1. Thử chạy từng phần SQL một (chia nhỏ)
2. Kiểm tra xem có lỗi syntax không
3. Đảm bảo bạn đang ở đúng project trong Supabase Dashboard

