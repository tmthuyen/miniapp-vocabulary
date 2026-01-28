# Theme Presets - Các Theme Màu Có Sẵn

File này chứa các theme màu đã được tối ưu để dễ nhìn và professional.

## 🎨 Cách Sử Dụng

1. Mở file `src/lib/theme-presets.ts`
2. Copy theme bạn thích
3. Paste vào `src/lib/theme-config.ts` (thay thế `light` và `dark`)
4. Cập nhật `src/app/globals.css` với giá trị mới

## 📋 Danh Sách Themes

### 1. 🌿 Emerald/Teal (Đề xuất - Đang dùng)

**Ưu điểm:**
- ✅ Dễ nhìn nhất, không chói mắt
- ✅ Professional, phù hợp học tập
- ✅ Contrast tốt, dễ đọc
- ✅ Modern, clean

**Màu chính:** Emerald-600 (Light) / Emerald-500 (Dark)

**Phù hợp cho:** Ứng dụng học tập, giáo dục

---

### 2. 💜 Violet/Purple

**Ưu điểm:**
- ✅ Modern, creative
- ✅ Không quá chói
- ✅ Unique, nổi bật

**Màu chính:** Violet-600 (Light) / Violet-500 (Dark)

**Phù hợp cho:** Ứng dụng sáng tạo, design

---

### 3. 🧡 Amber/Orange

**Ưu điểm:**
- ✅ Warm, friendly
- ✅ Energetic
- ✅ Dễ nhận biết

**Màu chính:** Amber-600 (Light) / Amber-500 (Dark)

**Phù hợp cho:** Ứng dụng năng động, social

---

### 4. ⚫ Slate/Neutral

**Ưu điểm:**
- ✅ Minimalist
- ✅ Professional nhất
- ✅ Không màu mè

**Màu chính:** Slate-900 (Light) / White (Dark)

**Phù hợp cho:** Ứng dụng business, enterprise

---

## 🔄 Thay Đổi Theme

### Bước 1: Chọn theme từ `theme-presets.ts`

Ví dụ chọn Emerald:
```typescript
import { themePresets } from './theme-presets'

// Copy themePresets.emerald
```

### Bước 2: Cập nhật `theme-config.ts`

```typescript
export const themeConfig = {
  radius: "0.75rem",
  light: themePresets.emerald.light,
  dark: themePresets.emerald.dark,
}
```

### Bước 3: Cập nhật `globals.css`

Copy giá trị từ `themeConfig.light` → `:root`
Copy giá trị từ `themeConfig.dark` → `.dark`

### Bước 4: Refresh browser

Xem thay đổi ngay lập tức!

---

## 💡 Tips

- **Emerald/Teal** là lựa chọn tốt nhất cho ứng dụng học tập
- Test cả Light và Dark mode sau khi thay đổi
- Đảm bảo contrast ratio đủ (WCAG AA)
- Cards và Modals sẽ tự động sử dụng màu mới

