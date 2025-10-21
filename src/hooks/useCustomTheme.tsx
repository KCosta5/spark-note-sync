import { useState, useEffect } from 'react';

export type ThemeColor = 'blue' | 'green' | 'purple' | 'orange' | 'pink';

const themes = {
  blue: {
    light: {
      primary: '217 91% 60%',
      'primary-glow': '217 91% 70%',
      secondary: '142 76% 36%',
      accent: '142 76% 36%',
      ring: '217 91% 60%',
      success: '142 76% 36%',
      'gradient-primary': 'linear-gradient(135deg, hsl(217 91% 60%), hsl(142 76% 36%))',
      'shadow-glow': '0 0 20px hsl(210 70% 45% / 0.12)',
    },
    dark: {
      primary: '217 91% 60%',
      'primary-glow': '217 91% 70%',
      secondary: '142 76% 36%',
      accent: '142 76% 36%',
      ring: '217 91% 60%',
      success: '142 76% 36%',
      'gradient-primary': 'linear-gradient(135deg, hsl(217 91% 60%), hsl(142 76% 36%))',
      'shadow-glow': '0 0 20px hsl(210 70% 55% / 0.2)',
    },
  },
  green: {
    light: {
      primary: '142 76% 36%',
      'primary-glow': '142 76% 46%',
      secondary: '160 84% 39%',
      accent: '160 84% 39%',
      ring: '142 76% 36%',
      success: '142 76% 36%',
      'gradient-primary': 'linear-gradient(135deg, hsl(142 76% 36%), hsl(160 84% 39%))',
      'shadow-glow': '0 0 20px hsl(142 76% 36% / 0.12)',
    },
    dark: {
      primary: '142 76% 46%',
      'primary-glow': '142 76% 56%',
      secondary: '160 84% 39%',
      accent: '160 84% 39%',
      ring: '142 76% 46%',
      success: '142 76% 46%',
      'gradient-primary': 'linear-gradient(135deg, hsl(142 76% 46%), hsl(160 84% 39%))',
      'shadow-glow': '0 0 20px hsl(142 76% 46% / 0.2)',
    },
  },
  purple: {
    light: {
      primary: '271 81% 56%',
      'primary-glow': '271 81% 66%',
      secondary: '291 64% 42%',
      accent: '291 64% 42%',
      ring: '271 81% 56%',
      success: '142 76% 36%',
      'gradient-primary': 'linear-gradient(135deg, hsl(271 81% 56%), hsl(291 64% 42%))',
      'shadow-glow': '0 0 20px hsl(271 81% 56% / 0.12)',
    },
    dark: {
      primary: '271 81% 66%',
      'primary-glow': '271 81% 76%',
      secondary: '291 64% 52%',
      accent: '291 64% 52%',
      ring: '271 81% 66%',
      success: '142 76% 36%',
      'gradient-primary': 'linear-gradient(135deg, hsl(271 81% 66%), hsl(291 64% 52%))',
      'shadow-glow': '0 0 20px hsl(271 81% 66% / 0.2)',
    },
  },
  orange: {
    light: {
      primary: '24 94% 50%',
      'primary-glow': '24 94% 60%',
      secondary: '38 92% 50%',
      accent: '38 92% 50%',
      ring: '24 94% 50%',
      success: '142 76% 36%',
      'gradient-primary': 'linear-gradient(135deg, hsl(24 94% 50%), hsl(38 92% 50%))',
      'shadow-glow': '0 0 20px hsl(24 94% 50% / 0.12)',
    },
    dark: {
      primary: '24 94% 60%',
      'primary-glow': '24 94% 70%',
      secondary: '38 92% 60%',
      accent: '38 92% 60%',
      ring: '24 94% 60%',
      success: '142 76% 36%',
      'gradient-primary': 'linear-gradient(135deg, hsl(24 94% 60%), hsl(38 92% 60%))',
      'shadow-glow': '0 0 20px hsl(24 94% 60% / 0.2)',
    },
  },
  pink: {
    light: {
      primary: '330 81% 60%',
      'primary-glow': '330 81% 70%',
      secondary: '340 82% 52%',
      accent: '340 82% 52%',
      ring: '330 81% 60%',
      success: '142 76% 36%',
      'gradient-primary': 'linear-gradient(135deg, hsl(330 81% 60%), hsl(340 82% 52%))',
      'shadow-glow': '0 0 20px hsl(330 81% 60% / 0.12)',
    },
    dark: {
      primary: '330 81% 70%',
      'primary-glow': '330 81% 80%',
      secondary: '340 82% 62%',
      accent: '340 82% 62%',
      ring: '330 81% 70%',
      success: '142 76% 36%',
      'gradient-primary': 'linear-gradient(135deg, hsl(330 81% 70%), hsl(340 82% 62%))',
      'shadow-glow': '0 0 20px hsl(330 81% 70% / 0.2)',
    },
  },
};

export function useCustomTheme() {
  const [themeColor, setThemeColor] = useState<ThemeColor>(() => {
    const saved = localStorage.getItem('theme-color');
    return (saved as ThemeColor) || 'blue';
  });

  useEffect(() => {
    const updateColors = () => {
      const root = document.documentElement;
      const isDark = root.classList.contains('dark');
      const mode = isDark ? 'dark' : 'light';
      const colors = themes[themeColor][mode];

      Object.entries(colors).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value);
      });
    };

    updateColors();
    localStorage.setItem('theme-color', themeColor);

    // Watch for theme mode changes
    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, [themeColor]);

  return { themeColor, setThemeColor };
}
