import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { useTheme } from 'next-themes';

let initialized = false;

function initMermaid(isDark: boolean) {
  mermaid.initialize({
    startOnLoad: false,
    theme: isDark ? 'dark' : 'default',
    securityLevel: 'strict',
    fontFamily: 'inherit',
  });
  initialized = true;
}

interface MermaidBlockProps {
  code: string;
}

export function MermaidBlock({ code }: MermaidBlockProps) {
  const { resolvedTheme } = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const idRef = useRef(`mmd-${Math.random().toString(36).slice(2, 10)}`);

  useEffect(() => {
    const isDark = resolvedTheme === 'dark';
    initMermaid(isDark);
    let cancelled = false;

    mermaid
      .render(idRef.current, code)
      .then(({ svg }) => {
        if (cancelled) return;
        if (ref.current) ref.current.innerHTML = svg;
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message || 'Erro ao renderizar diagrama');
      });

    return () => {
      cancelled = true;
    };
  }, [code, resolvedTheme]);

  if (error) {
    return (
      <div className="my-4 p-3 rounded-md border border-destructive/40 bg-destructive/5 text-destructive text-sm">
        <p className="font-medium mb-1">Erro no diagrama Mermaid</p>
        <pre className="text-xs whitespace-pre-wrap">{error}</pre>
      </div>
    );
  }

  return <div ref={ref} className="my-4 flex justify-center overflow-x-auto" />;
}