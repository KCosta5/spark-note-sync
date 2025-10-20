import { Note, Priority } from '@/lib/db';
import { Plus, Search, FileText, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

interface NotesListProps {
  notes: Note[];
  selectedNoteId?: string;
  onSelectNote: (id: string) => void;
  onNewNote: () => void;
}

export function NotesList({ notes, selectedNoteId, onSelectNote, onNewNote }: NotesListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPreviewText = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent?.slice(0, 100) || '';
  };

  const getPriorityBadge = (priority?: Priority) => {
    const variants = {
      low: { label: 'Baixa', className: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20' },
      medium: { label: 'Média', className: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20' },
      high: { label: 'Alta', className: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20' },
      urgent: { label: 'Urgente', className: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20' },
    };
    const variant = variants[priority || 'medium'];
    return <Badge variant="outline" className={variant.className}>{variant.label}</Badge>;
  };

  return (
    <div className="flex flex-col h-full border-r border-border bg-card">
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Cadernos</h2>
          <Button onClick={onNewNote} size="sm" className="gradient-primary text-white">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar anotações..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'Nenhuma anotação encontrada' : 'Nenhum caderno ainda'}
            </p>
          </div>
        ) : (
          <div className="p-2">
            {filteredNotes.map((note) => (
              <button
                key={note.id}
                onClick={() => onSelectNote(note.id)}
                className="w-full text-left p-3 rounded-lg mb-2 transition-smooth hover:bg-accent"
                style={selectedNoteId === note.id ? { backgroundColor: 'hsl(var(--accent))', boxShadow: 'var(--shadow-soft)' } : {}}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-medium truncate flex-1">{note.title || 'Sem título'}</h3>
                  <div className="flex items-center gap-2 shrink-0">
                    {getPriorityBadge(note.priority)}
                    {!note.synced && (
                      <span className="h-2 w-2 rounded-full bg-primary" title="Não sincronizado" />
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {getPreviewText(note.content)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(note.updatedAt).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
