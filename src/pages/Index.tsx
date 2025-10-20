import { useState, useEffect, useCallback } from 'react';
import { Note, getAllNotes, getNote, saveNote, deleteNote } from '@/lib/db';
import { syncNotes } from '@/lib/sync';
import { NotesList } from '@/components/NotesList';
import { NoteEditor } from '@/components/NoteEditor';
import { SyncIndicator } from '@/components/SyncIndicator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Menu, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const loadNotes = useCallback(async () => {
    const loadedNotes = await getAllNotes();
    setNotes(loadedNotes);
  }, []);

  useEffect(() => {
    loadNotes();
    syncNotes();
  }, [loadNotes]);

  const handleSelectNote = async (id: string) => {
    const note = await getNote(id);
    if (note) {
      setSelectedNote(note);
      setTitle(note.title);
      setContent(note.content);
      if (isMobile) setIsSidebarOpen(false);
    }
  };

  const handleNewNote = () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: 'Untitled Note',
      content: '<p>Start writing...</p>',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      synced: false,
    };
    
    setSelectedNote(newNote);
    setTitle(newNote.title);
    setContent(newNote.content);
    if (isMobile) setIsSidebarOpen(false);
  };

  const handleSave = useCallback(async () => {
    if (!selectedNote) return;

    const updatedNote: Note = {
      ...selectedNote,
      title: title || 'Untitled Note',
      content,
      updatedAt: Date.now(),
      synced: false,
    };

    await saveNote(updatedNote);
    await loadNotes();
    setSelectedNote(updatedNote);

    if (navigator.onLine) {
      syncNotes();
    }
  }, [selectedNote, title, content, loadNotes]);

  useEffect(() => {
    if (!selectedNote) return;

    const timeoutId = setTimeout(() => {
      handleSave();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [title, content, handleSave, selectedNote]);

  const handleDelete = async () => {
    if (!selectedNote) return;

    await deleteNote(selectedNote.id);
    await loadNotes();
    setSelectedNote(null);
    setTitle('');
    setContent('');
    
    toast({
      title: 'Note deleted',
      description: 'The note has been deleted successfully.',
    });

    if (navigator.onLine) {
      syncNotes();
    }
  };

  const sidebar = (
    <NotesList
      notes={notes}
      selectedNoteId={selectedNote?.id}
      onSelectNote={handleSelectNote}
      onNewNote={handleNewNote}
    />
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {isMobile ? (
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetContent side="left" className="p-0 w-80">
            {sidebar}
          </SheetContent>
        </Sheet>
      ) : (
        <div className="w-80 shrink-0">
          {sidebar}
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isMobile && (
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
              )}
              {selectedNote ? (
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Note title..."
                  className="text-xl font-semibold border-none shadow-none px-0 focus-visible:ring-0"
                />
              ) : (
                <h1 className="text-xl font-semibold">NotesSync</h1>
              )}
            </div>
            <div className="flex items-center gap-3">
              <SyncIndicator />
              {selectedNote && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDelete}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-hidden bg-gradient-subtle">
          {selectedNote ? (
            <NoteEditor
              content={content}
              onChange={setContent}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4 max-w-md px-4">
                <div className="w-16 h-16 mx-auto gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-semibold">Welcome to NotesSync</h2>
                <p className="text-muted-foreground">
                  Your offline-first note-taking app. Create a new note to get started, and your notes will sync automatically when you're online.
                </p>
                <Button onClick={handleNewNote} className="gradient-primary shadow-soft">
                  Create Your First Note
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;
