import { Tag as TagType } from '@/lib/db';
import { Tag as TagIcon, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TagSelectorProps {
  tags: TagType[];
  selectedTagIds: string[];
  onToggleTag: (tagId: string) => void;
}

export function TagSelector({ tags, selectedTagIds, onToggleTag }: TagSelectorProps) {
  const selectedTags = tags.filter(tag => selectedTagIds.includes(tag.id));

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <TagIcon className="h-3 w-3 mr-1" />
            Tags
            {selectedTagIds.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                {selectedTagIds.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Adicionar Tags</h4>
            <ScrollArea className="h-48">
              {tags.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Nenhuma tag disponível
                </p>
              ) : (
                <div className="flex flex-col gap-1">
                  {tags.map((tag) => {
                    const isSelected = selectedTagIds.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        onClick={() => onToggleTag(tag.id)}
                        className={`flex items-center gap-2 p-2 rounded-md text-sm transition-colors ${
                          isSelected
                            ? 'bg-accent'
                            : 'hover:bg-accent/50'
                        }`}
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        <span className="flex-1 text-left">{tag.name}</span>
                        {isSelected && (
                          <Badge variant="secondary" className="h-5">✓</Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
        </PopoverContent>
      </Popover>

      {selectedTags.map((tag) => (
        <Badge
          key={tag.id}
          variant="outline"
          className="gap-1"
          style={{
            borderColor: tag.color,
            backgroundColor: `${tag.color}15`,
            color: tag.color,
          }}
        >
          {tag.name}
          <button
            onClick={() => onToggleTag(tag.id)}
            className="hover:bg-black/10 rounded-full"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
    </div>
  );
}
