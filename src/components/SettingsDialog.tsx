import { Settings, Moon, Sun } from 'lucide-react';
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
import DocsDialog from '@/components/DocsDialog';

export function SettingsDialog() {
  const { theme, setTheme } = useTheme();

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
        </div>
      </DialogContent>
    </Dialog>
  );
}
