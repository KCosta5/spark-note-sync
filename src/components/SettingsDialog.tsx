import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import DocsDialog from '@/components/DocsDialog';

export function SettingsDialog() {
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
          <p className="text-sm text-muted-foreground">
            Use a documentação para saber mais sobre os recursos disponíveis.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
