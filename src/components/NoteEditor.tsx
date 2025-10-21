import { useState, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bold, Italic, List, ListOrdered, CheckSquare, Heading1, Heading2, Heading3, Quote, Code, Table as TableIcon, Eye, Edit3, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

interface NoteEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function NoteEditor({ content, onChange }: NoteEditorProps) {
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('split');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const imageMarkdown = `\n![${file.name}](${reader.result})\n`;
    onChange(content + imageMarkdown);
  };
  reader.readAsDataURL(file);
}, [content, onChange]);


  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap items-center gap-1 px-4 py-2 border-b border-border bg-muted/30">
        <div className="flex gap-1 mr-2">
          <Button
  variant={viewMode === 'edit' ? 'default' : 'ghost'}
  size="sm"
  aria-label="Modo edição"
  title="Modo Edição"
>
  <Edit3 className="h-4 w-4" />
</Button>
<Button
  variant={viewMode === 'split' ? 'default' : 'ghost'}
  size="sm"
  aria-label="Modo dividido"
  title="Modo Split"
>
  <Eye className="h-4 w-4 mr-1" />
  <Edit3 className="h-4 w-4" />
</Button>
<Button
  variant={viewMode === 'preview' ? 'default' : 'ghost'}
  size="sm"
  aria-label="Modo pré-visualização"
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
  title="Inserir imagem"
  onClick={() => document.getElementById('image-upload')?.click()}
>
  🖼️
</Button>
<input
  id="image-upload"
  type="file"
  accept="image/*"
  className="hidden"
  onChange={handleImageUpload}
/>
      </div>
      
      <div className={`flex-1 flex overflow-hidden ${viewMode === 'split' ? 'divide-x divide-border' : ''}`}>
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} flex flex-col`}>
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1 resize-none border-0 rounded-none font-mono text-sm p-6 focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Digite seu markdown aqui..."
            />
          </div>
        )}
        
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} overflow-auto p-6`}>
            <article className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  input: ({ node, ...props }) => (
                    <input 
                      {...props} 
                      disabled={false}
                      className="cursor-pointer"
                    />
                  ),
                }}
              >
                {content || '*Nenhum conteúdo ainda...*'}
              </ReactMarkdown>
            </article>
          </div>
        )}
      </div>
    </div>
  );
}
