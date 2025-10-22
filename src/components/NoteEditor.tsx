import React, { useCallback, useEffect, useMemo, useRef, useState, useReducer } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import { Bold, Italic, List, ListOrdered, CheckSquare, Heading1, Heading2, Heading3, Quote, Code, Table as TableIcon, Eye, Edit3, Link as LinkIcon, Image as ImageIcon, Upload, Highlighter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

interface NoteEditorProps {
  content?: string;
  onChange?: (content: string) => void;
}

type State = {
  content: string;
  past: string[];
  future: string[];
};

type Action =
  | { type: 'SET'; content: string }
  | { type: 'RESET'; content: string }
  | { type: 'UNDO' }
  | { type: 'REDO' };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET': {
      if (action.content === state.content) return state;
      return {
        content: action.content,
        past: [...state.past, state.content].slice(-100), // limit history
        future: [],
      };
    }
    case 'RESET':
      return { content: action.content, past: [], future: [] };
    case 'UNDO': {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      const newPast = state.past.slice(0, -1);
      return {
        content: previous,
        past: newPast,
        future: [state.content, ...state.future].slice(0, 100),
      };
    }
    case 'REDO': {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      const newFuture = state.future.slice(1);
      return {
        content: next,
        past: [...state.past, state.content].slice(-100),
        future: newFuture,
      };
    }
    default:
      return state;
  }
};

export default function NoteEditor({ content = '', onChange }: NoteEditorProps) {
  const [state, dispatch] = useReducer(reducer, { content, past: [], future: [] });
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('split');
  const [isMobile, setIsMobile] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Keep external onChange in sync
  useEffect(() => {
    onChange?.(state.content);
  }, [state.content, onChange]);

  // Respond to external content prop changes
  useEffect(() => {
    dispatch({ type: 'RESET', content });
  }, [content]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile && viewMode === 'split') setViewMode('edit');
  }, [isMobile, viewMode]);

  // Utilities that operate on the current state via dispatcher
  const updateSelectionAfterInsert = useCallback((pos: number) => {
    setTimeout(() => {
      const ta = textareaRef.current;
      if (!ta) return;
      ta.focus();
      const p = Math.max(0, Math.min(ta.value.length, pos));
      ta.setSelectionRange(p, p);
    }, 0);
  }, []);

  const insertAt = useCallback((start: number, insertText: string) => {
    const cur = state.content;
    const newContent = cur.substring(0, start) + insertText + cur.substring(start);
    dispatch({ type: 'SET', content: newContent });
    updateSelectionAfterInsert(start + insertText.length);
  }, [state.content, updateSelectionAfterInsert]);

  const insertMarkdown = useCallback((before: string, after = '', placeholder = '') => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = state.content.substring(start, end) || placeholder;
    const toInsert = before + selected + after;
    const newContent = state.content.substring(0, start) + toInsert + state.content.substring(end);
    dispatch({ type: 'SET', content: newContent });
    const newCursorPos = start + before.length + selected.length;
    updateSelectionAfterInsert(newCursorPos);
  }, [state.content, updateSelectionAfterInsert]);

  const insertAtLineStart = useCallback((prefix: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const lineStart = state.content.lastIndexOf('\n', start - 1) + 1;
    const newContent = state.content.substring(0, lineStart) + prefix + state.content.substring(lineStart);
    dispatch({ type: 'SET', content: newContent });
    updateSelectionAfterInsert(start + prefix.length);
  }, [state.content, updateSelectionAfterInsert]);

  const insertTable = useCallback(() => {
    const table = '\n| Coluna 1 | Coluna 2 | Coluna 3 |\n|----------|----------|----------|\n| Célula 1 | Célula 2 | Célula 3 |\n| Célula 4 | Célula 5 | Célula 6 |\n\n';
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    insertAt(start, table);
  }, [insertAt]);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const imageMarkdown = `\n![${file.name}](${base64})\n`;
      insertAt(start, imageMarkdown);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [insertAt]);

  const insertHighlight = useCallback(() => insertMarkdown('==', '==', 'texto destacado'), [insertMarkdown]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isMod = e.ctrlKey || e.metaKey;
    if (isMod) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          insertMarkdown('**', '**', 'negrito');
          return;
        case 'i':
          e.preventDefault();
          insertMarkdown('*', '*', 'itálico');
          return;
        case 'k':
          e.preventDefault();
          insertMarkdown('[', '](url)', 'texto do link');
          return;
        case '`':
          e.preventDefault();
          insertMarkdown('`', '`', 'código');
          return;
        case 'z':
          e.preventDefault();
          if (e.shiftKey) {
            dispatch({ type: 'REDO' });
          } else {
            dispatch({ type: 'UNDO' });
          }
          return;
        case 'y':
          e.preventDefault();
          dispatch({ type: 'REDO' });
          return;
      }
    }
  }, [insertMarkdown]);

  const renderedMarkdown = useMemo(() => {
    const processed = (state.content || '*Nenhum conteúdo ainda...*').replace(/==(.*?)==/g, '<mark>$1</mark>');
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]}
        components={{
          input: ({ node, ...props }) => (
            <input {...props} disabled={false} className="cursor-pointer" />
          ),
          img: ({ node, ...props }) => (
            <img {...props} className="rounded-lg my-4 max-w-full h-auto shadow-soft" loading="lazy" alt={props.alt || 'Imagem'} />
          ),
          mark: ({ node, ...props }) => (
            <mark className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded" {...props} />
          ),
        }}
      >
        {processed}
      </ReactMarkdown>
    );
  }, [state.content]);

  return (
    <div className="flex flex-col h-full">
      <div role="toolbar" className="flex flex-wrap items-center gap-1 px-2 sm:px-4 py-2 border-b border-border bg-muted/30 overflow-x-auto">
        <div className="flex gap-1 mr-2 shrink-0">
          <Button variant={viewMode === 'edit' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('edit')} title="Modo Edição" aria-label="Modo Edição">
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === 'split' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('split')} title="Modo Split" aria-label="Modo Split">
            <Edit3 className="h-4 w-4 mr-1" />
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === 'preview' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('preview')} title="Modo Preview" aria-label="Modo Preview">
            <Eye className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Button variant="ghost" size="sm" onClick={() => insertAtLineStart('# ')} title="Título 1" aria-label="Título 1">
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => insertAtLineStart('## ')} title="Título 2" aria-label="Título 2">
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => insertAtLineStart('### ')} title="Título 3" aria-label="Título 3">
          <Heading3 className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Button variant="ghost" size="sm" onClick={() => insertMarkdown('**', '**', 'negrito')} title="Negrito" aria-label="Negrito">
          <Bold className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => insertMarkdown('*', '*', 'itálico')} title="Itálico" aria-label="Itálico">
          <Italic className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => insertMarkdown('`', '`', 'código')} title="Código inline" aria-label="Código inline">
          <Code className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Button variant="ghost" size="sm" onClick={() => insertAtLineStart('- ')} title="Lista" aria-label="Lista">
          <List className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => insertAtLineStart('1. ')} title="Lista numerada" aria-label="Lista numerada">
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => insertAtLineStart('- [ ] ')} title="Checklist" aria-label="Checklist">
          <CheckSquare className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Button variant="ghost" size="sm" onClick={() => insertAtLineStart('> ')} title="Citação" aria-label="Citação">
          <Quote className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => insertMarkdown('\n```\n', '\n```\n', 'código')} title="Bloco de código" aria-label="Bloco de código">
          <Code className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="sm" onClick={insertTable} title="Inserir tabela" aria-label="Inserir tabela">
          <TableIcon className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => insertMarkdown('[', '](url)', 'texto do link')} title="Link" aria-label="Link">
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} title="Upload de imagem" aria-label="Upload de imagem">
          <Upload className="h-4 w-4" />
        </Button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        <Button variant="ghost" size="sm" onClick={insertHighlight} title="Destacar texto" aria-label="Destacar texto">
          <Highlighter className="h-4 w-4" />
        </Button>

        <div className="ml-2 flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => dispatch({ type: 'UNDO' })} title="Desfazer (Ctrl+Z)" aria-label="Desfazer">⟲</Button>
          <Button size="sm" variant="ghost" onClick={() => dispatch({ type: 'REDO' })} title="Refazer (Ctrl+Y / Shift+Ctrl+Z)" aria-label="Refazer">⟳</Button>
        </div>
      </div>

      <div className={`flex-1 flex overflow-hidden ${viewMode === 'split' && !isMobile ? 'divide-x divide-border' : 'flex-col'}`}>
        {(viewMode === 'edit' || (viewMode === 'split' && !isMobile)) && (
          <div className={`${viewMode === 'split' && !isMobile ? 'w-1/2' : 'w-full'} flex flex-col`}>
            <Textarea
              ref={textareaRef}
              value={state.content}
              onChange={(e) => dispatch({ type: 'SET', content: e.target.value })}
              onKeyDown={handleKeyDown}
              className="flex-1 resize-none border-0 rounded-none font-mono text-xs sm:text-sm p-4 sm:p-6 focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Digite seu markdown aqui..."
            />
          </div>
        )}

        {(viewMode === 'preview' || (viewMode === 'split' && !isMobile)) && (
          <div className={`${viewMode === 'split' && !isMobile ? 'w-1/2' : 'w-full'} overflow-auto p-4 sm:p-6`}>
            <article className="prose prose-sm sm:prose dark:prose-invert max-w-none">
              {renderedMarkdown}
            </article>
          </div>
        )}
      </div>
    </div>
  );
}
