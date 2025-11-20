import { useState } from 'react';
import { Tag as TagType } from '@/lib/db';
import { Plus, X, Tag as TagIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface TagManagerProps {
  tags: TagType[];
  selectedTagIds: string[];
  onSelectTag: (tagId: string) => void;
  onCreateTag: (name: string, color: string) => void;
  onDeleteTag: (id: string) => void;
}

const TAG_COLORS = [
  { name: 'Vermelho', value: '#ef4444' },
  { name: 'Laranja', value: '#f97316' },
  { name: 'Amarelo', value: '#eab308' },
  { name: 'Verde', value: '#22c55e' },
  { name: 'Azul', value: '#3b82f6' },
  { name: 'Roxo', value: '#a855f7' },
  { name: 'Rosa', value: '#ec4899' },
  { name: 'Cinza', value: '#6b7280' },
];

export function TagManager({
  tags,
  selectedTagIds,
  onSelectTag,
  onCreateTag,
  onDeleteTag,
}: TagManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0].value);

  const handleCreateTag = () => {
    if (newTagName.trim()) {
      onCreateTag(newTagName.trim(), selectedColor);
      setNewTagName('');
      setSelectedColor(TAG_COLORS[0].value);
      setIsOpen(false);
    }
  };

  return (
    <div className="border-b border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TagIcon className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Tags</h3>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="ghost" className="h-7">
              <Plus className="h-3 w-3" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Tag</DialogTitle>
              <DialogDescription>
                Adicione uma tag para organizar suas anotações
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="tag-name">Nome da Tag</Label>
                <Input
                  id="tag-name"
                  placeholder="Ex: Matemática, História..."
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
                />
              </div>
              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="grid grid-cols-4 gap-2">
                  {TAG_COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setSelectedColor(color.value)}
                      className={`h-10 rounded-md transition-all ${
                        selectedColor === color.value
                          ? 'ring-2 ring-primary ring-offset-2'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateTag} className="gradient-primary text-white">
                Criar Tag
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="h-24">
        {tags.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            Nenhuma tag criada ainda
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const isSelected = selectedTagIds.includes(tag.id);
              return (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="cursor-pointer transition-all group relative pr-7"
                  style={{
                    borderColor: tag.color,
                    backgroundColor: isSelected ? `${tag.color}20` : 'transparent',
                    color: tag.color,
                  }}
                  onClick={() => onSelectTag(tag.id)}
                >
                  {tag.name}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTag(tag.id);
                    }}
                    className="absolute right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
