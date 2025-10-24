import React, { useEffect, useState } from 'react';
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
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

export function DocsDialog() {
  const [docText, setDocText] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch('/DOCS.md')
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to fetch DOCS.md: ${r.status}`);
        return r.text();
      })
      .then((txt) => {
        if (!mounted) return;
        setDocText(txt);
      })
      .catch((e: any) => {
        if (!mounted) return;
        setErr(String(e.message || e));
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

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
          <ScrollArea className="h-[60vh] p-4">
            <div className="prose prose-sm dark:prose-invert">
              {loading && <div>Carregando documentação…</div>}
              {err && <div className="text-destructive">Erro: {err}</div>}
              {!loading && !err && docText && (
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{docText}</ReactMarkdown>
              )}

              {/* Fallback: list components if doc doesn't include them */}
              <h4>Componentes detectados</h4>
              <ul>
                {COMPONENTS.map((c) => (
                  <li key={c} className="capitalize">{c}</li>
                ))}
              </ul>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DocsDialog;
