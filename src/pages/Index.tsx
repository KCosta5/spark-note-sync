import { useState, useEffect, useCallback, useRef } from 'react';
import { Note, Folder, getAllNotes, getNotesByFolder, getAllFolders, getNote, saveNote, saveFolder, deleteNote, deleteFolder, Priority } from '@/lib/db';
import { syncNotes } from '@/lib/sync';
import { NotesList } from '@/components/NotesList';
import { NoteEditor } from '@/components/NoteEditor';
import { SyncIndicator } from '@/components/SyncIndicator';
import { SettingsDialog } from '@/components/SettingsDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Menu, FileText, Flag, Download, FileDown, FileImage } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ThemeProvider } from 'next-themes';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const Index = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>(undefined);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const previewRef = useRef<HTMLDivElement>(null);

  const loadNotes = useCallback(async () => {
    const loadedNotes = await getNotesByFolder(selectedFolderId);
    setNotes(loadedNotes);
  }, [selectedFolderId]);

  const loadFolders = useCallback(async () => {
    const loadedFolders = await getAllFolders();
    setFolders(loadedFolders);
  }, []);

  useEffect(() => {
    loadNotes();
    loadFolders();
    syncNotes();
  }, [loadNotes, loadFolders]);

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
      title: 'Nova Anotação',
      content: '',
      priority: 'medium',
      folderId: selectedFolderId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      synced: false,
    };
    
    setSelectedNote(newNote);
    setTitle(newNote.title);
    setContent(newNote.content);
    if (isMobile) setIsSidebarOpen(false);
  };

  const handleCreateFolder = async (name: string) => {
    const newFolder: Folder = {
      id: crypto.randomUUID(),
      name,
      createdAt: Date.now(),
      synced: false,
    };

    await saveFolder(newFolder);
    await loadFolders();
    
    toast({
      title: 'Pasta criada',
      description: `A pasta "${name}" foi criada com sucesso.`,
    });
  };

  const handleDeleteFolder = async (id: string) => {
    await deleteFolder(id);
    await loadFolders();
    if (selectedFolderId === id) {
      setSelectedFolderId(undefined);
    }
    
    toast({
      title: 'Pasta excluída',
      description: 'A pasta foi excluída com sucesso.',
    });
  };

  const handleSave = useCallback(async () => {
    if (!selectedNote) return;

    const updatedNote: Note = {
      ...selectedNote,
      title: title || 'Nova Anotação',
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
      title: 'Anotação excluída',
      description: 'A anotação foi excluída com sucesso.',
    });

    if (navigator.onLine) {
      syncNotes();
    }
  };

  const handlePriorityChange = async (priority: Priority) => {
    if (!selectedNote) return;

    const updatedNote: Note = {
      ...selectedNote,
      priority,
      updatedAt: Date.now(),
      synced: false,
    };

    await saveNote(updatedNote);
    await loadNotes();
    setSelectedNote(updatedNote);

    if (navigator.onLine) {
      syncNotes();
    }
  };

  const handleExportMarkdown = () => {
    if (!selectedNote) return;

    const fileName = (title || 'nota').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const timestamp = new Date().toISOString().split('T')[0];
    const metadata = `---
title: ${title || 'Nota sem título'}
date: ${new Date().toLocaleDateString('pt-BR')}
exported: ${new Date().toISOString()}
---

`;
    
    const fullContent = metadata + content;
    const blob = new Blob([fullContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}_${timestamp}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Exportado!',
      description: 'Nota exportada como Markdown com metadados.',
    });
  };

  const handleExportPDF = async () => {
    if (!selectedNote || !previewRef.current) return;

    try {
      toast({
        title: 'Gerando PDF...',
        description: 'Aguarde enquanto convertemos sua nota.',
      });

      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      pdf.addImage(
        imgData,
        'PNG',
        imgX,
        imgY,
        imgWidth * ratio,
        imgHeight * ratio
      );

      const fileName = (title || 'nota').replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const timestamp = new Date().toISOString().split('T')[0];
      pdf.save(`${fileName}_${timestamp}.pdf`);

      toast({
        title: 'PDF gerado!',
        description: 'Sua nota foi exportada como PDF.',
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar o PDF. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleExportPNG = async () => {
    if (!selectedNote || !previewRef.current) return;

    try {
      toast({
        title: 'Gerando imagem...',
        description: 'Aguarde enquanto convertemos sua nota.',
      });

      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
      });

      canvas.toBlob((blob) => {
        if (!blob) return;
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const fileName = (title || 'nota').replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const timestamp = new Date().toISOString().split('T')[0];
        a.href = url;
        a.download = `${fileName}_${timestamp}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: 'Imagem gerada!',
          description: 'Sua nota foi exportada como PNG.',
        });
      });
    } catch (error) {
      console.error('Erro ao gerar PNG:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar a imagem. Tente novamente.',
        variant: 'destructive',
      });
    }
  };


  const sidebar = (
    <NotesList
      notes={notes}
      folders={folders}
      selectedFolderId={selectedFolderId}
      selectedNoteId={selectedNote?.id}
      onSelectNote={handleSelectNote}
      onSelectFolder={setSelectedFolderId}
      onNewNote={handleNewNote}
      onCreateFolder={handleCreateFolder}
      onDeleteFolder={handleDeleteFolder}
    />
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <div className="flex h-screen overflow-hidden bg-background">
          {isMobile ? (
            <SheetContent side="left" className="p-0 w-80">
              {sidebar}
            </SheetContent>
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
                      <Button variant="ghost" size="icon">
                        <Menu className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>
                  )}
                  {selectedNote ? (
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título da anotação..."
                  className="text-xl font-semibold border-none shadow-none px-0 focus-visible:ring-0"
                />
              ) : (
                <h1 className="text-xl font-semibold">Caderno Escolar</h1>
              )}
            </div>
            <div className="flex items-center gap-3">
              <SettingsDialog />
              <SyncIndicator />
              {selectedNote && (
                <>
                  <Select value={selectedNote.priority} onValueChange={handlePriorityChange}>
                    <SelectTrigger className="w-32">
                      <Flag className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Exportar nota"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleExportMarkdown}>
                        <FileText className="h-4 w-4 mr-2" />
                        Exportar como Markdown
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleExportPDF}>
                        <FileDown className="h-4 w-4 mr-2" />
                        Exportar como PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleExportPNG}>
                        <FileImage className="h-4 w-4 mr-2" />
                        Exportar como PNG
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDelete}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-hidden bg-gradient-subtle">
          {selectedNote ? (
            <NoteEditor
              content={content}
              onChange={setContent}
              noteId={selectedNote.id}
              previewRef={previewRef}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4 max-w-md px-4">
                <div className="w-16 h-16 mx-auto gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-semibold">Bem-vindo ao Caderno Escolar</h2>
                <p className="text-muted-foreground">
                  Seu caderno digital para estudos. Crie uma nova anotação para começar, e tudo será sincronizado automaticamente quando você estiver online.
                </p>
                <Button onClick={handleNewNote} className="gradient-primary text-white shadow-soft">
                  Criar Primeira Anotação
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
      </Sheet>
    </ThemeProvider>
  );
};

export default Index;
