# Theme Sync Checklist ✅

## Đã cập nhật theme Emerald/Teal

### ✅ Files đã sync với theme-config.ts:
1. **src/app/globals.css** - Đã cập nhật với giá trị từ theme-config.ts
2. **src/components/ui/button.tsx** - Dùng theme colors (primary, destructive-foreground)
3. **src/components/ui/badge.tsx** - Dùng theme colors
4. **src/components/ui/card.tsx** - Dùng bg-card, text-card-foreground
5. **src/components/ui/input.tsx** - Dùng theme colors
6. **src/components/ui/dialog.tsx** - Dùng bg-popover
7. **src/components/layout/navbar.tsx** - Dùng text-primary, bg-primary
8. **src/app/auth/login/page.tsx** - Dùng text-primary, text-destructive
9. **src/app/auth/signup/page.tsx** - Dùng text-primary, text-destructive
10. **src/components/vocabulary/add-vocabulary-dialog.tsx** - Dùng text-destructive

### 🎨 Theme Colors đang sử dụng:
- **Primary**: Emerald-600 (Light) / Emerald-500 (Dark)
- **Background**: White (Light) / Slate-950 (Dark)
- **Foreground**: Slate-900 (Light) / Slate-50 (Dark)
- **Cards**: White (Light) / Slate-950 (Dark)
- **Destructive**: Red-500 (Light) / Red-700 (Dark)

### 🔍 Cách kiểm tra theme đã apply:
1. Mở browser DevTools
2. Inspect element (ví dụ: button)
3. Kiểm tra computed styles
4. Màu nên là emerald/teal (hsl(173, 80%, 40%))

### ⚠️ Nếu vẫn thấy màu đen trắng:
1. **Hard refresh**: Ctrl+Shift+R (Windows) hoặc Cmd+Shift+R (Mac)
2. **Clear cache**: Xóa browser cache
3. **Check CSS**: Đảm bảo globals.css đã được load
4. **Check Tailwind**: Đảm bảo Tailwind đang dùng CSS variables

### 📝 Lưu ý:
- Tất cả components đã dùng theme colors
- Không còn hardcoded colors (trừ overlay backdrop)
- Theme sẽ tự động apply khi thay đổi theme-config.ts

