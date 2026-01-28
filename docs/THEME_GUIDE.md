# Hướng dẫn Thay đổi Theme Màu sắc

## ⚠️ QUAN TRỌNG

**CHỈ THAY ĐỔI MÀU SẮC Ở FILE: `src/lib/theme-config.ts`**

KHÔNG BAO GIỜ thay đổi màu sắc ở các file khác!

## Cách thay đổi màu sắc

### Bước 1: Mở file `src/lib/theme-config.ts`

### Bước 2: Thay đổi giá trị HSL

Format: `"H S% L%"` (Hue, Saturation, Lightness)

Ví dụ:
```typescript
primary: "221.2 83.2% 53.3%", // Blue-600
```

### Bước 3: Áp dụng thay đổi

Sau khi thay đổi `theme-config.ts`, bạn cần cập nhật `src/app/globals.css` để đồng bộ:

1. Copy giá trị từ `themeConfig.light` → paste vào `:root` trong `globals.css`
2. Copy giá trị từ `themeConfig.dark` → paste vào `.dark` trong `globals.css`

## Các màu có thể thay đổi

### Light Mode (`themeConfig.light`)
- `background` - Nền chính
- `foreground` - Màu chữ chính
- `card` - Nền card
- `primary` - Màu chủ đạo (buttons, links)
- `secondary` - Màu phụ
- `muted` - Màu cho text phụ
- `accent` - Màu highlight
- `destructive` - Màu cảnh báo/xóa
- `border` - Màu viền
- `input` - Màu input border

### Dark Mode (`themeConfig.dark`)
- Tương tự như Light Mode

## Ví dụ: Đổi sang màu xanh lá

```typescript
// Light mode
primary: "142 76% 36%", // Green-600

// Dark mode  
primary: "142 70% 45%", // Green-500
```

## Lưu ý

- Luôn test cả Light và Dark mode sau khi thay đổi
- Đảm bảo contrast ratio đủ để dễ đọc (WCAG AA)
- Cards và Modals sẽ tự động sử dụng màu mới

