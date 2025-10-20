import { useState } from 'react';
import { Folder as FolderIcon, Plus, Trash2, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Folder } from '@/lib/db';

interface FolderManagerProps {
  folders: Folder[];
  selectedFolderId?: string;
  onSelectFolder: (folderId?: string) => void;
  onCreateFolder: (name: string) => void;
  onDeleteFolder: (id: string) => void;
}

export function FolderManager({
  folders,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onDeleteFolder,
}: FolderManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const handleCreate = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim());
      setNewFolderName('');
      setIsOpen(false);
    }
  };

  return (
    <div className="border-b border-border p-3 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Pastas</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 px-2">
              <Plus className="h-3 w-3" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Pasta</DialogTitle>
              <DialogDescription>
                Crie uma pasta para organizar suas anotações.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                placeholder="Nome da pasta..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                autoFocus
              />
              <Button onClick={handleCreate} className="w-full">
                Criar Pasta
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="max-h-48">
        <div className="space-y-1">
          <button
            onClick={() => onSelectFolder(undefined)}
            className="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-smooth hover:bg-accent animate-fade-in"
            style={!selectedFolderId ? { backgroundColor: 'hsl(var(--accent))', fontWeight: 500 } : {}}
          >
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              <span>Todas as notas</span>
            </div>
          </button>

          {folders.map((folder, index) => (
            <div
              key={folder.id}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-smooth hover:bg-accent group animate-fade-in"
              style={{
                ...(selectedFolderId === folder.id ? { backgroundColor: 'hsl(var(--accent))', fontWeight: 500 } : {}),
                animationDelay: `${index * 50}ms`
              }}
            >
              <button
                onClick={() => onSelectFolder(folder.id)}
                className="flex items-center gap-2 flex-1 text-left"
              >
                <FolderIcon className="h-4 w-4" />
                <span className="truncate">{folder.name}</span>
              </button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteFolder(folder.id);
                }}
              >
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
