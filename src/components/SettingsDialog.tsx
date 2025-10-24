import { useState } from 'react';
import { Settings, Moon, Sun, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useTheme } from 'next-themes';
import { useCustomTheme, type ThemeColor } from '@/hooks/useCustomTheme';
import ThemeEditor from '@/components/ThemeEditor';
import ThemeCssEditor from '@/components/ThemeCssEditor';

export function SettingsDialog() {
  const { theme, setTheme } = useTheme();
  const { themeColor, setThemeColor } = useCustomTheme();
  const [submenu, setSubmenu] = useState<'vars' | 'css'>('vars');

  const themeColors: { value: ThemeColor; label: string; color: string }[] = [
    { value: 'blue', label: 'Azul', color: 'bg-blue-500' },
    { value: 'green', label: 'Verde', color: 'bg-green-500' },
    { value: 'purple', label: 'Roxo', color: 'bg-purple-500' },
    { value: 'orange', label: 'Laranja', color: 'bg-orange-500' },
    { value: 'pink', label: 'Rosa', color: 'bg-pink-500' },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Configurações">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configurações</DialogTitle>
          <DialogDescription>
            Personalize sua experiência no Caderno Escolar.
          </DialogDescription>
        </DialogHeader>
  <div className="space-y-6 py-4 max-h-[65vh] overflow-auto pr-2">
          <div className="space-y-3">
            <Label>Modo</Label>
            <div className="flex gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('light')}
                className="flex-1"
              >
                <Sun className="h-4 w-4 mr-2" />
                Claro
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('dark')}
                className="flex-1"
              >
                <Moon className="h-4 w-4 mr-2" />
                Escuro
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('system')}
                className="flex-1"
              >
                Sistema
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Cor do Tema
            </Label>
            <div className="grid grid-cols-5 gap-2">
              {themeColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setThemeColor(color.value)}
                  className={`relative h-12 rounded-md border-2 transition-all ${
                    themeColor === color.value
                      ? 'border-primary scale-110'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                  title={color.label}
                >
                  <div className={`absolute inset-1 rounded ${color.color}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-border">
            <Label>Editor Avançado de Tema</Label>
            <p className="text-sm text-muted-foreground">Edite variáveis do tema (HSL, hex) ou personalize o CSS completo do tema.</p>

            <div className="mt-2">
              <div className="inline-flex rounded-md shadow-sm" role="tablist" aria-label="Editor Avançado de Tema">
                <Button size="sm" variant={submenu === 'vars' ? 'default' : 'outline'} className="rounded-r-none" onClick={() => setSubmenu('vars')}>
                  Variáveis
                </Button>
                <Button size="sm" variant={submenu === 'css' ? 'default' : 'outline'} className="rounded-l-none" onClick={() => setSubmenu('css')}>
                  CSS
                </Button>
              </div>

              <div className="pt-4">
                {submenu === 'vars' ? (
                  <div className="space-y-4">
                    <ThemeEditor />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <ThemeCssEditor />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
