/**
 * THEME CONFIGURATION - TẬP TRUNG
 *
 * Đây là file DUY NHẤT để thay đổi màu sắc của toàn bộ ứng dụng.
 * KHÔNG BAO GIỜ thay đổi màu sắc ở các file khác.
 *
 * Format: HSL (Hue, Saturation, Lightness)
 * Example: "221.2 83.2% 53.3%" = hsl(221.2, 83.2%, 53.3%)
 */

/**
 * THEME: Modern Emerald/Teal
 *
 * ✅ Dễ nhìn, không chói mắt
 * ✅ Professional, phù hợp học tập
 * ✅ Contrast tốt, dễ đọc
 * ✅ Modern, clean design
 */

export const themeConfig = {
  // Border radius
  radius: "0.75rem", // 12px - Modern rounded

  // Light Mode Colors - Emerald/Teal Theme
  light: {
    background: "0 0% 100%", // Trắng tinh khiết
    foreground: "222.2 47.4% 11.2%", // Chữ đậm nhưng không quá đen

    card: "0 0% 100%",
    cardForeground: "222.2 47.4% 11.2%",

    popover: "0 0% 100%",
    popoverForeground: "222.2 47.4% 11.2%",

    primary: "173 80% 40%", // Emerald-600 - Xanh lá ngọc, dễ nhìn
    primaryForeground: "0 0% 100%",

    secondary: "210 40% 96.1%", // Xám nhạt
    secondaryForeground: "222.2 47.4% 11.2%",

    muted: "210 40% 96.1%",
    mutedForeground: "215.4 16.3% 46.9%",

    accent: "173 80% 40%", // Emerald accent
    accentForeground: "0 0% 100%",

    destructive: "0 84.2% 60.2%",
    destructiveForeground: "0 0% 100%",

    border: "214.3 31.8% 91.4%",
    input: "214.3 31.8% 91.4%",
    ring: "173 80% 40%",
  },
  dark: {
    background: "222.2 84% 4.9%", // Nền tối
    foreground: "210 40% 98%",

    card: "222.2 84% 4.9%",
    cardForeground: "210 40% 98%",

    popover: "222.2 84% 4.9%",
    popoverForeground: "210 40% 98%",

    primary: "173 80% 50%", // Emerald-500 - Sáng hơn cho dark mode
    primaryForeground: "222.2 47.4% 11.2%",

    secondary: "217.2 32.6% 17.5%",
    secondaryForeground: "210 40% 98%",

    muted: "217.2 32.6% 17.5%",
    mutedForeground: "215 20.2% 65.1%",

    accent: "173 80% 50%",
    accentForeground: "222.2 47.4% 11.2%",

    destructive: "0 62.8% 30.6%",
    destructiveForeground: "210 40% 98%",

    border: "217.2 32.6% 17.5%",
    input: "217.2 32.6% 17.5%",
    ring: "173 80% 50%",
  },
};

/**
 * Helper function để generate CSS variables
 */
export function generateThemeCSS() {
  const lightVars = Object.entries(themeConfig.light)
    .map(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      return `  --${cssKey}: ${value};`;
    })
    .join("\n");

  const darkVars = Object.entries(themeConfig.dark)
    .map(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      return `  --${cssKey}: ${value};`;
    })
    .join("\n");

  return { lightVars, darkVars };
}
