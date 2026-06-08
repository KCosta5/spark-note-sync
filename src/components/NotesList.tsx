import { Note, Priority, Folder } from '@/lib/db';
import { Plus, Search, FileText, Trash2, RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { FolderManager } from '@/components/FolderManager';
import { useState, memo } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface NotesListProps {
  notes: Note[];
  folders: Folder[];
  selectedFolderId?: string;
  selectedNoteId?: string;
  onSelectNote: (id: string) => void;
  onSelectFolder: (folderId?: string) => void;
  onNewNote: () => void;
  onCreateFolder: (name: string) => void;
  onDeleteFolder: (id: string) => void;
  viewingTrash?: boolean;
  trashCount?: number;
  onToggleTrash?: () => void;
  onRestoreNote?: (id: string) => void;
  onPermanentDelete?: (id: string) => void;
  onEmptyTrash?: () => void;
}

const NotesListComponent = ({
  notes,
  folders,
  selectedFolderId,
  selectedNoteId,
  onSelectNote,
  onSelectFolder,
  onNewNote,
  onCreateFolder,
  onDeleteFolder,
  viewingTrash = false,
  trashCount = 0,
  onToggleTrash,
  onRestoreNote,
  onPermanentDelete,
  onEmptyTrash,
}: NotesListProps) => {
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
    const variants: Record<Priority, { label: string; className: string }> = {
      low: { label: 'Baixa', className: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20' },
      medium: { label: 'Média', className: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20' },
      high: { label: 'Alta', className: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20' },
      urgent: { label: 'Urgente', className: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20' },
    };
    const safePriority: Priority = priority || 'medium';
    const variant = variants[safePriority];
    return <Badge variant="outline" className={variant.className}>{variant.label}</Badge>;
  };

  return (
    <div className="flex flex-col h-full border-r border-border bg-card">
      {!viewingTrash && (
        <FolderManager
          folders={folders}
          selectedFolderId={selectedFolderId}
          onSelectFolder={onSelectFolder}
          onCreateFolder={onCreateFolder}
          onDeleteFolder={onDeleteFolder}
        />
      )}
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            {viewingTrash ? (
              <>
                <Trash2 className="h-5 w-5" />
                Lixeira
              </>
            ) : (
              'Cadernos'
            )}
          </h2>
          <div className="flex gap-1">
            {viewingTrash ? (
              <>
                {trashCount > 0 && onEmptyTrash && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline" title="Esvaziar lixeira">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Esvaziar a lixeira?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Todas as {trashCount} notas serão excluídas permanentemente. Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={onEmptyTrash} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Esvaziar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                <Button size="sm" variant="ghost" onClick={onToggleTrash} title="Voltar">
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                {onToggleTrash && (
                  <Button size="sm" variant="ghost" onClick={onToggleTrash} title={`Lixeira${trashCount ? ` (${trashCount})` : ''}`}>
                    <Trash2 className="h-4 w-4" />
                    {trashCount > 0 && <span className="ml-1 text-xs">{trashCount}</span>}
                  </Button>
                )}
                <Button onClick={onNewNote} size="sm" className="gradient-primary text-white">
                  <Plus className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={viewingTrash ? 'Buscar na lixeira...' : 'Buscar anotações...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            {viewingTrash ? (
              <Trash2 className="h-12 w-12 text-muted-foreground mb-4" />
            ) : (
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            )}
            <p className="text-sm text-muted-foreground">
              {searchQuery
                ? 'Nenhuma anotação encontrada'
                : viewingTrash
                ? 'Lixeira vazia'
                : 'Nenhum caderno ainda'}
            </p>
          </div>
        ) : (
          <div className="p-2">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className="w-full text-left p-3 rounded-lg mb-2 transition-smooth hover:bg-accent group"
                style={selectedNoteId === note.id ? { backgroundColor: 'hsl(var(--accent))', boxShadow: 'var(--shadow-soft)' } : {}}
              >
                <button
                  onClick={() => onSelectNote(note.id)}
                  className="w-full text-left"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-medium truncate flex-1">{note.title || 'Sem título'}</h3>
                    <div className="flex items-center gap-2 shrink-0">
                      {getPriorityBadge(note.priority)}
                      {!note.synced && !viewingTrash && (
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
                {viewingTrash && (
                  <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    {onRestoreNote && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-7 text-xs"
                        onClick={(e) => { e.stopPropagation(); onRestoreNote(note.id); }}
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Restaurar
                      </Button>
                    )}
                    {onPermanentDelete && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-7 text-xs text-destructive hover:text-destructive"
                        onClick={(e) => { e.stopPropagation(); onPermanentDelete(note.id); }}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Excluir
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export const NotesList = memo(NotesListComponent);
