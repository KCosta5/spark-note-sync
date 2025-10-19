import { Note } from '@/lib/db';
import { Plus, Search, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
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
                className={cn(
                  'w-full text-left p-3 rounded-lg mb-2 transition-smooth hover:bg-accent',
                  selectedNoteId === note.id && 'bg-accent shadow-soft'
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-medium truncate flex-1">{note.title || 'Untitled'}</h3>
                  {!note.synced && (
                    <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" title="Not synced" />
                  )}
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
