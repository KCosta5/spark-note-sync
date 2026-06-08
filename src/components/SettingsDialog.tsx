import { Settings, Moon, Sun, Palette, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { useTheme } from 'next-themes';
import { useCustomTheme, type ThemeColor } from '@/hooks/useCustomTheme';
import { useRef, useState } from 'react';
import { exportBackup, importBackup, type ImportMode } from '@/lib/backup';
import { useToast } from '@/hooks/use-toast';

export function SettingsDialog() {
  const { theme, setTheme } = useTheme();
  const { themeColor, setThemeColor } = useCustomTheme();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [confirmMode, setConfirmMode] = useState<ImportMode | null>(null);

  const themeColors: { value: ThemeColor; label: string; color: string }[] = [
    { value: 'blue', label: 'Azul', color: 'bg-blue-500' },
    { value: 'green', label: 'Verde', color: 'bg-green-500' },
    { value: 'purple', label: 'Roxo', color: 'bg-purple-500' },
    { value: 'orange', label: 'Laranja', color: 'bg-orange-500' },
    { value: 'pink', label: 'Rosa', color: 'bg-pink-500' },
  ];

  const handleExport = async () => {
    try {
      await exportBackup();
      toast({ title: 'Backup exportado', description: 'O arquivo foi baixado com sucesso.' });
    } catch (err: any) {
      toast({ title: 'Erro ao exportar', description: err?.message || 'Falha desconhecida', variant: 'destructive' });
    }
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPendingFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const runImport = async (mode: ImportMode) => {
    if (!pendingFile) return;
    try {
      const result = await importBackup(pendingFile, mode);
      toast({
        title: 'Backup restaurado',
        description: `${result.notes} notas, ${result.folders} pastas, ${result.images} imagens importadas. Recarregue para ver as alterações.`,
      });
      setPendingFile(null);
      setConfirmMode(null);
      setTimeout(() => window.location.reload(), 800);
    } catch (err: any) {
      toast({ title: 'Erro ao importar', description: err?.message || 'Arquivo inválido', variant: 'destructive' });
      setPendingFile(null);
      setConfirmMode(null);
    }
  };

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

          <div className="space-y-3">
            <Label>Backup</Label>
            <p className="text-xs text-muted-foreground">
              Exporte todas as suas notas, pastas e imagens em um único arquivo JSON. Use a restauração para trazer tudo de volta em outro dispositivo.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExport} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="flex-1">
                <Upload className="h-4 w-4 mr-2" />
                Restaurar
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                onChange={handleFilePick}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Choose import mode */}
      <AlertDialog open={!!pendingFile && !confirmMode} onOpenChange={(o) => !o && setPendingFile(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Como deseja restaurar?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>Mesclar</strong> mantém o que você já tem e adiciona/atualiza pelos IDs do backup.<br />
              <strong>Substituir tudo</strong> apaga todos os dados atuais antes de importar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel onClick={() => setPendingFile(null)}>Cancelar</AlertDialogCancel>
            <Button variant="outline" onClick={() => runImport('merge')}>Mesclar</Button>
            <AlertDialogAction onClick={() => setConfirmMode('replace')}>Substituir tudo</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm destructive replace */}
      <AlertDialog open={confirmMode === 'replace'} onOpenChange={(o) => !o && setConfirmMode(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Substituir todos os dados?</AlertDialogTitle>
            <AlertDialogDescription>
              Isto apagará permanentemente todas as notas, pastas e imagens atuais antes de restaurar o backup. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmMode(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => runImport('replace')} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Sim, substituir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
