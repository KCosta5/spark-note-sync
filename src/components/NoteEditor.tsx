import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Bold, Italic, List, ListOrdered, CheckSquare, Heading1, Heading2, Heading3, Quote, Code, Table as TableIcon, Eye, Edit3, Link as LinkIcon, Image as ImageIcon, Upload, Highlighter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { saveImage, getImage } from '@/lib/db';

interface NoteEditorProps {
  content: string;
  onChange: (content: string) => void;
  noteId?: string;
  previewRef?: React.RefObject<HTMLDivElement>;
}

export function NoteEditor({ content, onChange, noteId, previewRef: externalPreviewRef }: NoteEditorProps) {
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('split');
  const [isMobile, setIsMobile] = useState(false);
  const [imageUrls, setImageUrls] = useState<Map<string, string>>(new Map());
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const internalPreviewRef = useRef<HTMLDivElement>(null);
  const previewRef = externalPreviewRef || internalPreviewRef;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const insertMarkdown = useCallback((before: string, after: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const textToInsert = selectedText || placeholder;
    
    const newContent = 
      content.substring(0, start) + 
      before + textToInsert + after + 
      content.substring(end);
    
    onChange(newContent);
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + textToInsert.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [content, onChange]);

  const insertAtLineStart = useCallback((prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const lineStart = content.lastIndexOf('\n', start - 1) + 1;
    
    const newContent = 
      content.substring(0, lineStart) + 
      prefix + 
      content.substring(lineStart);
    
    onChange(newContent);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length);
    }, 0);
  }, [content, onChange]);

  const insertTable = useCallback(() => {
    const table = '\n| Coluna 1 | Coluna 2 | Coluna 3 |\n|----------|----------|----------|\n| Célula 1 | Célula 2 | Célula 3 |\n| Célula 4 | Célula 5 | Célula 6 |\n\n';
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const newContent = content.substring(0, start) + table + content.substring(start);
    onChange(newContent);
  }, [content, onChange]);

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !noteId) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem');
      return;
    }

    const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Save to IndexedDB
    await saveImage({
      id: imageId,
      noteId,
      blob: file,
      name: file.name,
      createdAt: Date.now(),
    });

    // Create object URL for immediate preview
    const objectUrl = URL.createObjectURL(file);
    setImageUrls(prev => new Map(prev).set(imageId, objectUrl));

    // Insert markdown reference
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const imageMarkdown = `\n![${file.name}](idb://${imageId})\n`;
    const newContent = content.substring(0, start) + imageMarkdown + content.substring(start);
    onChange(newContent);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [content, onChange, noteId]);

  // Load images from IndexedDB
  useEffect(() => {
    const loadImages = async () => {
      const imageIds = content.match(/idb:\/\/([a-zA-Z0-9_]+)/g)?.map(match => match.replace('idb://', '')) || [];
      const urls = new Map<string, string>();
      
      for (const imageId of imageIds) {
        if (!imageUrls.has(imageId)) {
          const imageData = await getImage(imageId);
          if (imageData) {
            const url = URL.createObjectURL(imageData.blob);
            urls.set(imageId, url);
          }
        }
      }
      
      if (urls.size > 0) {
        setImageUrls(prev => new Map([...prev, ...urls]));
      }
    };

    loadImages();
  }, [content]);

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      imageUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imageUrls]);

  const insertHighlight = useCallback(() => {
    insertMarkdown('==', '==', 'texto destacado');
  }, [insertMarkdown]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          insertMarkdown('**', '**', 'negrito');
          break;
        case 'i':
          e.preventDefault();
          insertMarkdown('*', '*', 'itálico');
          break;
        case 'k':
          e.preventDefault();
          insertMarkdown('[', '](url)', 'texto do link');
          break;
        case '`':
          e.preventDefault();
          insertMarkdown('`', '`', 'código');
          break;
      }
    }
  }, [insertMarkdown]);

  // Auto-switch to single pane on mobile
  useEffect(() => {
    if (isMobile && viewMode === 'split') {
      setViewMode('edit');
    }
  }, [isMobile, viewMode]);

  const renderedMarkdown = useMemo(() => {
    const processedContent = (content || '*Nenhum conteúdo ainda...*').replace(/==(.*?)==/g, '<mark>$1</mark>');
    
    return (
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        urlTransform={(url) => {
          if (typeof url === 'string') {
            // Handle IndexedDB images
            if (url.startsWith('idb://')) {
              const imageId = url.replace('idb://', '');
              return imageUrls.get(imageId) || '';
            }
            // Allow data URLs
            if (url.startsWith('data:image/')) {
              return url;
            }
            // Validate other URLs
            try {
              new URL(url);
              return url;
            } catch {
              return '';
            }
          }
          return '';
        }}
        components={{
          input: ({ node, ...props }) => (
            <input 
              {...props} 
              disabled={false}
              className="cursor-pointer"
            />
          ),
          img: ({ node, ...props }) => (
            <img 
              {...props} 
              className="rounded-lg my-4 max-w-full h-auto shadow-soft"
              loading="lazy"
              alt={props.alt || 'Imagem'}
            />
          ),
          mark: ({ node, ...props }) => (
            <mark className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded" {...props} />
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    );
  }, [content, imageUrls]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap items-center gap-1 px-2 sm:px-4 py-2 border-b border-border bg-muted/30 overflow-x-auto">
        <div className="flex gap-1 mr-2 shrink-0">
          <Button
            variant={viewMode === 'edit' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('edit')}
            title="Modo Edição"
          >
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'split' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('split')}
            title="Modo Split"
          >
            <Edit3 className="h-4 w-4 mr-1" />
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'preview' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('preview')}
            title="Modo Preview"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertAtLineStart('# ')}
          title="Título 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertAtLineStart('## ')}
          title="Título 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertAtLineStart('### ')}
          title="Título 3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('**', '**', 'negrito')}
          title="Negrito"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('*', '*', 'itálico')}
          title="Itálico"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('`', '`', 'código')}
          title="Código inline"
        >
          <Code className="h-4 w-4" />
        </Button>
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertAtLineStart('- ')}
          title="Lista"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertAtLineStart('1. ')}
          title="Lista numerada"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertAtLineStart('- [ ] ')}
          title="Checklist"
        >
          <CheckSquare className="h-4 w-4" />
        </Button>
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertAtLineStart('> ')}
          title="Citação"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('\n```\n', '\n```\n', 'código')}
          title="Bloco de código"
        >
          <Code className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={insertTable}
          title="Inserir tabela"
        >
          <TableIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('[', '](url)', 'texto do link')}
          title="Link"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          title="Upload de imagem"
        >
          <Upload className="h-4 w-4" />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={insertHighlight}
          title="Destacar texto"
        >
          <Highlighter className="h-4 w-4" />
        </Button>
      </div>
      
      <div className={`flex-1 flex overflow-hidden ${viewMode === 'split' && !isMobile ? 'divide-x divide-border' : 'flex-col'}`}>
        {(viewMode === 'edit' || (viewMode === 'split' && !isMobile)) && (
          <div className={`${viewMode === 'split' && !isMobile ? 'w-1/2' : 'w-full'} flex flex-col`}>
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 resize-none border-0 rounded-none font-mono text-xs sm:text-sm p-4 sm:p-6 focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Digite seu markdown aqui..."
            />
          </div>
        )}
        
        {(viewMode === 'preview' || (viewMode === 'split' && !isMobile)) && (
          <div ref={previewRef} className={`${viewMode === 'split' && !isMobile ? 'w-1/2' : 'w-full'} overflow-auto p-4 sm:p-6`}>
            <article className="prose prose-sm sm:prose dark:prose-invert max-w-none">
              {renderedMarkdown}
            </article>
          </div>
        )}
      </div>
    </div>
  );
}
