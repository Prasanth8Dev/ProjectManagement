'use client';
import { useState, useRef } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useChecklist,
  useAddChecklistItem,
  useUpdateChecklistItem,
  useDeleteChecklistItem,
} from '@/hooks/use-checklists';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils/cn';

interface TaskChecklistProps {
  taskId: string;
}

export function TaskChecklist({ taskId }: TaskChecklistProps) {
  const [newItemText, setNewItemText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: items, isLoading } = useChecklist(taskId);
  const { mutate: createItem, isPending: isCreating } = useAddChecklistItem(taskId);
  const { mutate: updateItem } = useUpdateChecklistItem(taskId);
  const { mutate: deleteItem } = useDeleteChecklistItem(taskId);

  const completedCount = items?.filter((i) => i.isCompleted).length ?? 0;
  const totalCount = items?.length ?? 0;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleAddItem = () => {
    const title = newItemText.trim();
    if (!title) return;
    createItem(
      { title },
      {
        onSuccess: () => {
          setNewItemText('');
          inputRef.current?.focus();
        },
        onError: () => toast({ title: 'Failed to add item', variant: 'destructive' }),
      }
    );
  };

  const handleToggle = (itemId: string, isCompleted: boolean) => {
    updateItem({ itemId, data: { isCompleted: !isCompleted } });
  };

  const handleDelete = (itemId: string) => {
    deleteItem(
      itemId,
      {
        onError: () => toast({ title: 'Failed to delete item', variant: 'destructive' }),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-2 w-full" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-3.5 flex-1" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Progress */}
      {totalCount > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{completedCount}/{totalCount} completed</span>
            <span className="font-medium text-foreground">{progressPct}%</span>
          </div>
          <Progress value={progressPct} className="h-1.5" />
        </div>
      )}

      {/* Items */}
      {items && items.length > 0 && (
        <ul className="space-y-1.5">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-2.5 group py-0.5"
            >
              <Checkbox
                id={item.id}
                checked={item.isCompleted}
                onCheckedChange={() => handleToggle(item.id, item.isCompleted)}
                className="shrink-0"
              />
              <label
                htmlFor={item.id}
                className={cn(
                  'flex-1 text-sm cursor-pointer leading-snug select-none',
                  item.isCompleted &&
                    'line-through text-muted-foreground'
                )}
              >
                {item.title}
              </label>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                onClick={() => handleDelete(item.id)}
                aria-label="Delete checklist item"
              >
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {/* Add new item */}
      <div className="flex items-center gap-2 pt-1">
        <Input
          ref={inputRef}
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          placeholder="Add checklist item..."
          className="h-8 text-sm"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddItem();
            }
          }}
        />
        <Button
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={handleAddItem}
          disabled={!newItemText.trim() || isCreating}
          aria-label="Add item"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
