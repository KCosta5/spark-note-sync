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
import ThemeCssEditor from '@/components/ThemeCssEditor';
import DocsDialog from '@/components/DocsDialog';

export function SettingsDialog() {
  const { theme, setTheme } = useTheme();
  const { themeColor, setThemeColor } = useCustomTheme();
  // Only CSS editor is needed now

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
  <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-start justify-between w-full">
            <div>
              <DialogTitle>Configurações</DialogTitle>
              <DialogDescription>
                Personalize sua experiência no Caderno Escolar.
              </DialogDescription>
            </div>
            <div className="ml-4">
              <DocsDialog />
            </div>
          </div>
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
            <Label>Editor de Tema (CSS)</Label>
            <p className="text-sm text-muted-foreground">Personalize o CSS completo do tema.</p>
            <div className="mt-2 space-y-4">
              <ThemeCssEditor />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
