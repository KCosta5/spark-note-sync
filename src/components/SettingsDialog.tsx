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

export function SettingsDialog() {
  const { theme, setTheme } = useTheme();
  const { themeColor, setThemeColor } = useCustomTheme();

  const themeColors: { value: ThemeColor; label: string; color: string }[] = [
    { value: 'blue', label: 'Azul', color: 'bg-blue-500' },
    { value: 'green', label: 'Verde', color: 'bg-green-500' },
    { value: 'purple', label: 'Roxo', color: 'bg-purple-500' },
    { value: 'orange', label: 'Laranja', color: 'bg-orange-500' },
    { value: 'pink', label: 'Rosa', color: 'bg-pink-500' },
  ];

  useEffect(() => {
  localStorage.setItem('themeColor', themeColor);
}, [themeColor]);

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
        <div className="space-y-6 py-4">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
