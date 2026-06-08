import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SHORTCUTS: { keys: string; action: string }[] = [
  { keys: 'Ctrl/Cmd + B', action: 'Negrito' },
  { keys: 'Ctrl/Cmd + I', action: 'Itálico' },
  { keys: 'Ctrl/Cmd + K', action: 'Link' },
  { keys: 'Ctrl/Cmd + `', action: 'Código inline' },
  { keys: 'Ctrl/Cmd + Shift + H', action: 'Destacar texto' },
  { keys: 'Ctrl/Cmd + Shift + 1/2/3', action: 'Título 1 / 2 / 3' },
  { keys: 'Ctrl/Cmd + Shift + L', action: 'Lista' },
  { keys: 'Ctrl/Cmd + Shift + O', action: 'Lista numerada' },
  { keys: 'Ctrl/Cmd + Shift + C', action: 'Checklist' },
  { keys: 'Ctrl/Cmd + Shift + Q', action: 'Citação' },
  { keys: 'Ctrl/Cmd + Shift + E', action: 'Bloco de código' },
  { keys: 'Ctrl/Cmd + P', action: 'Alternar Preview / Edição' },
  { keys: 'Ctrl/Cmd + S', action: 'Salvar agora' },
  { keys: 'Ctrl/Cmd + /', action: 'Abrir esta lista de atalhos' },
];

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Atalhos de teclado</DialogTitle>
          <DialogDescription>Acelere sua escrita com atalhos no editor.</DialogDescription>
        </DialogHeader>
        <div className="divide-y divide-border max-h-[60vh] overflow-y-auto">
          {SHORTCUTS.map((s) => (
            <div key={s.keys} className="flex items-center justify-between py-2 text-sm">
              <span className="text-muted-foreground">{s.action}</span>
              <kbd className="px-2 py-1 rounded bg-muted font-mono text-xs">{s.keys}</kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}