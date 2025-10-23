import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import debounce from 'lodash.debounce';
import { 
  Bold, Italic, List, ListOrdered, CheckSquare, Heading1, Heading2, Heading3, 
  Quote, Code, Table as TableIcon, Eye, Edit3, Link as LinkIcon, Upload, Highlighter 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { saveImage, getImage } from '@/lib/db';

interface NoteEditorProps {
  content: string;
  onChange: (content: string) => void;
  noteId?: string;
}

export function NoteEditor({ content, onChange, noteId }: NoteEditorProps) {
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('split');
  const [isMobile, setIsMobile] = useState(false);
  const [localContent, setLocalContent] = useState(content);
  const [imageUrls, setImageUrls] = useState<Map<string, string>>(new Map());
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🧠 Detecta mobile e ajusta layout
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 🔁 Atualiza conteúdo local ao trocar de nota
  useEffect(() => setLocalContent(content), [content]);

  // 🕓 Atualização do conteúdo com debounce
  const debouncedUpdate = useMemo(
    () => debounce((value: string) => onChange(value), 300),
    [onChange]
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setLocalContent(value);
    debouncedUpdate(value);
  };

  // ✍️ Funções de inserção de markdown
  const insertMarkdown = useCallback((before: string, after = '', placeholder = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = localContent.substring(start, end);
    const textToInsert = selectedText || placeholder;

    const newContent =
      localContent.substring(0, start) + before + textToInsert + after + localContent.substring(end);
    setLocalContent(newContent);
    debouncedUpdate(newContent);

    setTimeout(() => {
      textarea.focus();
      const newCursor = start + before.length + textToInsert.length;
      textarea.setSelectionRange(newCursor, newCursor);
    }, 0);
  }, [localContent, debouncedUpdate]);

  const insertAtLineStart = useCallback((prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const lineStart = localContent.lastIndexOf('\n', start - 1) + 1;

    const newContent = localContent.substring(0, lineStart) + prefix + localContent.substring(lineStart);
    setLocalContent(newContent);
    debouncedUpdate(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length);
    }, 0);
  }, [localContent, debouncedUpdate]);

  const insertTable = useCallback(() => {
    const table = '\n| Coluna 1 | Coluna 2 | Coluna 3 |\n|----------|----------|----------|\n| Célula 1 | Célula 2 | Célula 3 |\n| Célula 4 | Célula 5 | Célula 6 |\n\n';
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const newContent = localContent.substring(0, start) + table + localContent.substring(start);
    setLocalContent(newContent);
    debouncedUpdate(newContent);
  }, [localContent, debouncedUpdate]);

  // 🖼️ Upload e salvamento de imagens no IndexedDB
  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !noteId) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem');
      return;
    }

    const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await saveImage({ id: imageId, noteId, blob: file, name: file.name, createdAt: Date.now() });
    const objectUrl = URL.createObjectURL(file);
    setImageUrls(prev => new Map(prev).set(imageId, objectUrl));

    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const imageMarkdown = `\n![${file.name}](idb://${imageId})\n`;
    const newContent = localContent.substring(0, start) + imageMarkdown + localContent.substring(start);
    setLocalContent(newContent);
    debouncedUpdate(newContent);

    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [localContent, debouncedUpdate, noteId]);

  // 🐢 Lazy loading das imagens
  useEffect(() => {
    const loadImages = async () => {
      const imageIds = localContent.match(/idb:\/\/([a-zA-Z0-9_]+)/g)?.map(m => m.replace('idb://', '')) || [];
      const newUrls = new Map<string, string>();
      const results = await Promise.allSettled(imageIds.map(id => getImage(id)));

      results.forEach((res, i) => {
        if (res.status === 'fulfilled' && res.value) {
          const url = URL.createObjectURL(res.value.blob);
          newUrls.set(imageIds[i], url);
        }
      });

      if (newUrls.size > 0) setImageUrls(prev => new Map([...prev, ...newUrls]));
    };
    loadImages();
  }, [localContent]);

  useEffect(() => () => imageUrls.forEach(url => URL.revokeObjectURL(url)), [imageUrls]);

  // 🟡 Destaque
  const insertHighlight = useCallback(() => insertMarkdown('==', '==', 'texto destacado'), [insertMarkdown]);

  // ⌨️ Atalhos de teclado
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b': e.preventDefault(); insertMarkdown('**', '**', 'negrito'); break;
        case 'i': e.preventDefault(); insertMarkdown('*', '*', 'itálico'); break;
        case 'k': e.preventDefault(); insertMarkdown('[', '](url)', 'link'); break;
        case '`': e.preventDefault(); insertMarkdown('`', '`', 'código'); break;
      }
    }
  }, [insertMarkdown]);

  // 📄 Markdown renderizado (otimizado)
  const renderedMarkdown = useMemo(() => {
    const processed = (localContent || '*Nenhum conteúdo ainda...*').replace(/==(.*?)==/g, '<mark>$1</mark>');
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        urlTransform={(url) => {
          if (typeof url === 'string') {
            if (url.startsWith('idb://')) {
              const id = url.replace('idb://', '');
              return imageUrls.get(id) || '';
            }
            if (url.startsWith('data:image/')) return url;
            try { new URL(url); return url; } catch { return ''; }
          }
          return '';
        }}
        components={{
          img: ({ node, ...props }) => (
            <img {...props} className="rounded-lg my-4 max-w-full h-auto shadow-sm" loading="lazy" />
          ),
          mark: ({ node, ...props }) => (
            <mark className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded" {...props} />
          )
        }}
      >
        {processed}
      </ReactMarkdown>
    );
  }, [localContent, imageUrls]);

  // 📱 Força modo edit no mobile
  useEffect(() => {
    if (isMobile && viewMode === 'split') setViewMode('edit');
  }, [isMobile, viewMode]);

  // 🧩 UI
  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 px-2 sm:px-4 py-2 border-b border-border bg-muted/30 overflow-x-auto">
        <div className="flex gap-1 mr-2 shrink-0">
          <Button variant={viewMode === 'edit' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('edit')}><Edit3 className="h-4 w-4" /></Button>
          <Button variant={viewMode === 'split' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('split')}><Edit3 className="h-4 w-4 mr-1" /><Eye className="h-4 w-4" /></Button>
          <Button variant={viewMode === 'preview' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('preview')}><Eye className="h-4 w-4" /></Button>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />
        {/* Botões markdown */}
        <Button variant="ghost" size="sm" onClick={() => insertAtLineStart('# ')} title="Título 1"><Heading1 className="h-4 w-4" /></Button>
        <Button variant="ghost" size="sm" onClick={() => insertAtLineStart('## ')} title="Título 2"><Heading2 className="h-4 w-4" /></Button>
        <Button variant="ghost" size="sm" onClick={() => insertAtLineStart('### ')} title="Título 3"><Heading3 className="h-4 w-4" /></Button>
        <Separator orientation="vertical" className="h-6 mx-1" />
        <Button variant="ghost" size="sm" onClick={() => insertMarkdown('**', '**', 'negrito')}><Bold className="h-4 w-4" /></Button>
        <Button variant="ghost" size="sm" onClick={() => insertMarkdown('*', '*', 'itálico')}><Italic className="h-4 w-4" /></Button>
        <Button variant="ghost" size="sm" onClick={() => insertMarkdown('`', '`', 'código')}><Code className="h-4 w-4" /></Button>
        <Separator orientation="vertical" className="h-6 mx-1" />
        <Button variant="ghost" size="sm" onClick={() => insertAtLineStart('- ')}><List className="h-4 w-4" /></Button>
        <Button variant="ghost" size="sm" onClick={() => insertAtLineStart('1. ')}><ListOrdered className="h-4 w-4" /></Button>
        <Button variant="ghost" size="sm" onClick={() => insertAtLineStart('- [ ] ')}><CheckSquare className="h-4 w-4" /></Button>
        <Separator orientation="vertical" className="h-6 mx-1" />
        <Button variant="ghost" size="sm" onClick={() => insertAtLineStart('> ')}><Quote className="h-4 w-4" /></Button>
        <Button variant="ghost" size="sm" onClick={() => insertMarkdown('\n```\n', '\n```\n', 'código')}><Code className="h-4 w-4" /></Button>
        <Button variant="ghost" size="sm" onClick={insertTable}><TableIcon className="h-4 w-4" /></Button>
        <Button variant="ghost" size="sm" onClick={() => insertMarkdown('[', '](url)', 'link')}><LinkIcon className="h-4 w-4" /></Button>
        <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}><Upload className="h-4 w-4" /></Button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        <Button variant="ghost" size="sm" onClick={insertHighlight}><Highlighter className="h-4 w-4" /></Button>
      </div>

      {/* Editor / Preview */}
      <div className={`flex-1 flex overflow-hidden ${viewMode === 'split' && !isMobile ? 'divide-x divide-border' : 'flex-col'}`}>
        {(viewMode === 'edit' || (viewMode === 'split' && !isMobile)) && (
          <div className={`${viewMode === 'split' && !isMobile ? 'w-1/2' : 'w-full'}`}>
            <Textarea
              ref={textareaRef}
              value={localContent}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="flex-1 resize-none border-0 rounded-none font-mono text-xs sm:text-sm p-4 sm:p-6 focus-visible:ring-0"
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
