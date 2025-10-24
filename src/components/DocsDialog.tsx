import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen } from 'lucide-react';
import COMPONENTS from '@/lib/componentsList';

export function DocsDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="ml-2">
          <BookOpen className="w-4 h-4 mr-2" />
          Documentação
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-3xl w-[90vw] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Documentação do Spark Note Sync</DialogTitle>
          <DialogDescription>Guia rápido e referência dos componentes usados pela aplicação.</DialogDescription>
        </DialogHeader>

        <div className="pt-4">
          <ScrollArea className="h-[60vh]">
            <section className="prose prose-sm dark:prose-invert">
              <h3>Visão Geral</h3>
              <p>
                Esta aplicação permite gerenciar notas e sincronizá-las. As opções de tema agora são
                aplicadas via CSS customizado. Use a aba de <strong>Editor de Tema (CSS)</strong> nas
                configurações para aplicar estilos globais.
              </p>

              <h3>Como aplicar estilos</h3>
              <ol>
                <li>Abra Configurações → Editor de Tema (CSS).</li>
                <li>Cole seu CSS customizado (use a classe :root para declarar variáveis).</li>
                <li>Clique em Aplicar para injetar o CSS imediatamente.</li>
                <li>Use Exportar/Importar para compartilhar presets de CSS.</li>
              </ol>

              <h3>Lista de componentes usados</h3>
              <p>Os principais componentes e primitives reutilizáveis incluídos no projeto:</p>
              <ul>
                {COMPONENTS.map((c) => (
                  <li key={c} className="capitalize">{c}</li>
                ))}
              </ul>

              <h3>Contribuindo</h3>
              <p>
                O projeto usa Tailwind CSS para estilos utilitários e Radix UI primitives para acessibilidade.
                Ao adicionar componentes, prefira componentes atômicos em <code>src/components/ui</code> e
                mantenha a API simples (props limitadas, variantes por classes).
              </p>

              <h3>Mais</h3>
              <p>
                Para detalhes de temas, veja <code>THEME_HELP.md</code> na raiz do projeto.
              </p>
            </section>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DocsDialog;
