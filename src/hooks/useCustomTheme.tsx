import { useState, useEffect } from 'react';

export type ThemeColor = 'blue' | 'green' | 'purple' | 'orange' | 'pink';

export type Preset = { name: string; type: 'css'; data: any };

export type UseCustomThemeReturn = {
  themeColor: ThemeColor;
  setThemeColor: (c: ThemeColor) => void;
  customCss: string;
  setCustomCss: (css: string) => void;
  resetCustomCss: () => void;
  presets: Preset[];
  savePreset: (name: string, type: 'css', data: any) => void;
  loadPreset: (name: string) => void;
  deletePreset: (name: string) => void;
};

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

export function useCustomTheme(): UseCustomThemeReturn {
  const [themeColor, setThemeColor] = useState<ThemeColor>(() => {
    const saved = localStorage.getItem('theme-color');
    return (saved as ThemeColor) || 'blue';
  });

  // Remove all customVars from localStorage and memory on load (migration)
  useEffect(() => {
    try {
      localStorage.removeItem('theme-custom-vars');
    } catch (e) {}
  }, []);
  const CUSTOM_CSS_KEY = 'theme-custom-css';
  const [customCss, setCustomCssState] = useState<string>(() => {
    try {
      return localStorage.getItem(CUSTOM_CSS_KEY) || '';
    } catch (e) {
      return '';
    }
  });

  const PRESETS_KEY = 'theme-presets';
  type Preset = { name: string; type: 'css'; data: any };
  const [presets, setPresets] = useState<Preset[]>(() => {
    try {
      const raw = localStorage.getItem(PRESETS_KEY);
      return raw ? JSON.parse(raw).filter((p: any) => p.type === 'css') : [];
    } catch (e) {
      return [];
    }
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
    // persist theme color only
    try {
      localStorage.setItem('theme-color', themeColor);
    } catch (e) {}

    // Apply any custom CSS (full stylesheet) if present
    applyCustomCssToDocument(customCss);

    // persist presets (only css type)
    try {
      localStorage.setItem(PRESETS_KEY, JSON.stringify(presets.filter((p) => p.type === 'css') || []));
    } catch (e) {}

    // Watch for theme mode changes
    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, [themeColor, customCss, presets]);



  // Apply a full CSS string into a <style id="user-theme-css"> element
  const applyCustomCssToDocument = (css: string) => {
    try {
      let el = document.getElementById('user-theme-css') as HTMLStyleElement | null;
      if (!el) {
        el = document.createElement('style');
        el.id = 'user-theme-css';
        document.head.appendChild(el);
      }
      el.textContent = css || '';
    } catch (e) {
      // ignore
    }
  };

  const setCustomCss = (css: string) => {
    setCustomCssState(css);
    try {
      localStorage.setItem(CUSTOM_CSS_KEY, css || '');
    } catch (e) {}
    applyCustomCssToDocument(css);
  };

  const resetCustomCss = () => {
    setCustomCssState('');
    try {
      localStorage.removeItem(CUSTOM_CSS_KEY);
    } catch (e) {}
    applyCustomCssToDocument('');
  };

  // Preset management (save/load/delete)

  const savePreset = (name: string, type: 'css', data: any) => {
    const next = [...presets.filter((p) => p.name !== name), { name, type, data }];
    setPresets(next);
    try {
      localStorage.setItem(PRESETS_KEY, JSON.stringify(next));
    } catch (e) {}
  };

  const loadPreset = (name: string) => {
    const p = presets.find((x) => x.name === name);
    if (!p) return;
    if (p.type === 'css') {
      setCustomCss(p.data || '');
    }
  };

  const deletePreset = (name: string) => {
    const next = presets.filter((p) => p.name !== name);
    setPresets(next);
    try {
      localStorage.setItem(PRESETS_KEY, JSON.stringify(next));
    } catch (e) {}
  };


  return {
    themeColor,
    setThemeColor,
    customCss,
    setCustomCss,
    resetCustomCss,
    presets,
    savePreset,
    loadPreset,
    deletePreset,
  };
}
