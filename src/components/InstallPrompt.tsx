import { useState } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { useToast } from '@/hooks/use-toast';

export function InstallPrompt() {
  const { isInstallable, promptInstall } = useInstallPrompt();
  const [isDismissed, setIsDismissed] = useState(false);
  const { toast } = useToast();

  if (!isInstallable || isDismissed) return null;

  const handleInstall = async () => {
    const accepted = await promptInstall();
    
    if (accepted) {
      toast({
        title: 'App instalado!',
        description: 'O Caderno Escolar foi instalado com sucesso.',
      });
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
      <div className="bg-card border border-border rounded-lg shadow-elegant p-4 max-w-sm flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shrink-0">
          <Download className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm mb-1">Instalar App</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Instale o Caderno Escolar na sua tela inicial para acesso rápido e offline.
          </p>
          <div className="flex gap-2">
            <Button 
              onClick={handleInstall}
              size="sm"
              className="gradient-primary text-white"
            >
              Instalar
            </Button>
            <Button 
              onClick={() => setIsDismissed(true)}
              size="sm"
              variant="ghost"
            >
              Mais tarde
            </Button>
          </div>
        </div>
        <Button
          onClick={() => setIsDismissed(true)}
          size="icon"
          variant="ghost"
          className="h-6 w-6 shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
