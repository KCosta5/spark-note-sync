import { useState, useEffect } from 'react';

export type ThemeColor = 'blue' | 'green' | 'purple' | 'orange' | 'pink';

const themes = {
  blue: {
    light: {
      primary: '217 91% 60%',
      'primary-glow': '217 91% 70%',
      secondary: '142 76% 36%',
      accent: '142 76% 36%',
    },
    dark: {
      primary: '217 91% 60%',
      'primary-glow': '217 91% 70%',
      secondary: '142 76% 36%',
      accent: '142 76% 36%',
    },
  },
  green: {
    light: {
      primary: '142 76% 36%',
      'primary-glow': '142 76% 46%',
      secondary: '160 84% 39%',
      accent: '160 84% 39%',
    },
    dark: {
      primary: '142 76% 46%',
      'primary-glow': '142 76% 56%',
      secondary: '160 84% 39%',
      accent: '160 84% 39%',
    },
  },
  purple: {
    light: {
      primary: '271 81% 56%',
      'primary-glow': '271 81% 66%',
      secondary: '291 64% 42%',
      accent: '291 64% 42%',
    },
    dark: {
      primary: '271 81% 66%',
      'primary-glow': '271 81% 76%',
      secondary: '291 64% 52%',
      accent: '291 64% 52%',
    },
  },
  orange: {
    light: {
      primary: '24 94% 50%',
      'primary-glow': '24 94% 60%',
      secondary: '38 92% 50%',
      accent: '38 92% 50%',
    },
    dark: {
      primary: '24 94% 60%',
      'primary-glow': '24 94% 70%',
      secondary: '38 92% 60%',
      accent: '38 92% 60%',
    },
  },
  pink: {
    light: {
      primary: '330 81% 60%',
      'primary-glow': '330 81% 70%',
      secondary: '340 82% 52%',
      accent: '340 82% 52%',
    },
    dark: {
      primary: '330 81% 70%',
      'primary-glow': '330 81% 80%',
      secondary: '340 82% 62%',
      accent: '340 82% 62%',
    },
  },
};

export function useCustomTheme() {
  const [themeColor, setThemeColor] = useState<ThemeColor>(() => {
    const saved = localStorage.getItem('theme-color');
    return (saved as ThemeColor) || 'blue';
  });

  useEffect(() => {
    const root = document.documentElement;
    const isDark = root.classList.contains('dark');
    const mode = isDark ? 'dark' : 'light';
    const colors = themes[themeColor][mode];

    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });

    localStorage.setItem('theme-color', themeColor);
  }, [themeColor]);

  return { themeColor, setThemeColor };
}
