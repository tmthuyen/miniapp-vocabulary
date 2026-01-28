/**
 * THEME PRESETS - Các theme màu sẵn có
 * 
 * Copy theme bạn thích vào theme-config.ts
 */

export const themePresets = {
  // Theme 1: Modern Emerald/Teal (Đề xuất - Dễ nhìn nhất)
  emerald: {
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
  },

  // Theme 2: Soft Violet/Purple (Modern, Creative)
  violet: {
    light: {
      background: "0 0% 100%",
      foreground: "222.2 47.4% 11.2%",
      card: "0 0% 100%",
      cardForeground: "222.2 47.4% 11.2%",
      popover: "0 0% 100%",
      popoverForeground: "222.2 47.4% 11.2%",
      primary: "262 83% 58%", // Violet-600
      primaryForeground: "0 0% 100%",
      secondary: "210 40% 96.1%",
      secondaryForeground: "222.2 47.4% 11.2%",
      muted: "210 40% 96.1%",
      mutedForeground: "215.4 16.3% 46.9%",
      accent: "262 83% 58%",
      accentForeground: "0 0% 100%",
      destructive: "0 84.2% 60.2%",
      destructiveForeground: "0 0% 100%",
      border: "214.3 31.8% 91.4%",
      input: "214.3 31.8% 91.4%",
      ring: "262 83% 58%",
    },
    dark: {
      background: "222.2 84% 4.9%",
      foreground: "210 40% 98%",
      card: "222.2 84% 4.9%",
      cardForeground: "210 40% 98%",
      popover: "222.2 84% 4.9%",
      popoverForeground: "210 40% 98%",
      primary: "263 70% 50.4%", // Violet-500
      primaryForeground: "210 40% 98%",
      secondary: "217.2 32.6% 17.5%",
      secondaryForeground: "210 40% 98%",
      muted: "217.2 32.6% 17.5%",
      mutedForeground: "215 20.2% 65.1%",
      accent: "263 70% 50.4%",
      accentForeground: "210 40% 98%",
      destructive: "0 62.8% 30.6%",
      destructiveForeground: "210 40% 98%",
      border: "217.2 32.6% 17.5%",
      input: "217.2 32.6% 17.5%",
      ring: "263 70% 50.4%",
    },
  },

  // Theme 3: Warm Amber/Orange (Energetic, Friendly)
  amber: {
    light: {
      background: "0 0% 100%",
      foreground: "222.2 47.4% 11.2%",
      card: "0 0% 100%",
      cardForeground: "222.2 47.4% 11.2%",
      popover: "0 0% 100%",
      popoverForeground: "222.2 47.4% 11.2%",
      primary: "25 95% 53%", // Amber-600
      primaryForeground: "0 0% 100%",
      secondary: "210 40% 96.1%",
      secondaryForeground: "222.2 47.4% 11.2%",
      muted: "210 40% 96.1%",
      mutedForeground: "215.4 16.3% 46.9%",
      accent: "25 95% 53%",
      accentForeground: "0 0% 100%",
      destructive: "0 84.2% 60.2%",
      destructiveForeground: "0 0% 100%",
      border: "214.3 31.8% 91.4%",
      input: "214.3 31.8% 91.4%",
      ring: "25 95% 53%",
    },
    dark: {
      background: "222.2 84% 4.9%",
      foreground: "210 40% 98%",
      card: "222.2 84% 4.9%",
      cardForeground: "210 40% 98%",
      popover: "222.2 84% 4.9%",
      popoverForeground: "210 40% 98%",
      primary: "43 96% 56%", // Amber-500
      primaryForeground: "222.2 47.4% 11.2%",
      secondary: "217.2 32.6% 17.5%",
      secondaryForeground: "210 40% 98%",
      muted: "217.2 32.6% 17.5%",
      mutedForeground: "215 20.2% 65.1%",
      accent: "43 96% 56%",
      accentForeground: "222.2 47.4% 11.2%",
      destructive: "0 62.8% 30.6%",
      destructiveForeground: "210 40% 98%",
      border: "217.2 32.6% 17.5%",
      input: "217.2 32.6% 17.5%",
      ring: "43 96% 56%",
    },
  },

  // Theme 4: Neutral Slate (Minimalist, Professional)
  slate: {
    light: {
      background: "0 0% 100%",
      foreground: "222.2 47.4% 11.2%",
      card: "0 0% 100%",
      cardForeground: "222.2 47.4% 11.2%",
      popover: "0 0% 100%",
      popoverForeground: "222.2 47.4% 11.2%",
      primary: "222.2 47.4% 11.2%", // Slate-900 - Đen nhẹ
      primaryForeground: "0 0% 100%",
      secondary: "210 40% 96.1%",
      secondaryForeground: "222.2 47.4% 11.2%",
      muted: "210 40% 96.1%",
      mutedForeground: "215.4 16.3% 46.9%",
      accent: "222.2 47.4% 11.2%",
      accentForeground: "0 0% 100%",
      destructive: "0 84.2% 60.2%",
      destructiveForeground: "0 0% 100%",
      border: "214.3 31.8% 91.4%",
      input: "214.3 31.8% 91.4%",
      ring: "222.2 47.4% 11.2%",
    },
    dark: {
      background: "222.2 84% 4.9%",
      foreground: "210 40% 98%",
      card: "222.2 84% 4.9%",
      cardForeground: "210 40% 98%",
      popover: "222.2 84% 4.9%",
      popoverForeground: "210 40% 98%",
      primary: "210 40% 98%", // Trắng cho dark mode
      primaryForeground: "222.2 47.4% 11.2%",
      secondary: "217.2 32.6% 17.5%",
      secondaryForeground: "210 40% 98%",
      muted: "217.2 32.6% 17.5%",
      mutedForeground: "215 20.2% 65.1%",
      accent: "210 40% 98%",
      accentForeground: "222.2 47.4% 11.2%",
      destructive: "0 62.8% 30.6%",
      destructiveForeground: "210 40% 98%",
      border: "217.2 32.6% 17.5%",
      input: "217.2 32.6% 17.5%",
      ring: "210 40% 98%",
    },
  },
} as const

