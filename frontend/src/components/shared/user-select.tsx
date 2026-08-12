'use client';
import { useState } from 'react';
import { Check, ChevronsUpDown, Loader2, X } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { UserAvatar } from '@/components/shared/user-avatar';
import { useUserSearch } from '@/hooks/use-members';
import { useDebounce } from '@/hooks/use-debounce';
import { User } from '@/types/user.types';
import { cn } from '@/lib/utils/cn';

interface UserSelectProps {
  value?: string;
  onChange?: (userId: string | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  users?: User[];
  className?: string;
  clearable?: boolean;
}

export function UserSelect({
  value,
  onChange,
  placeholder = 'Select user',
  disabled = false,
  users: staticUsers,
  className,
  clearable = true,
}: UserSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data: searchedUsers, isLoading } = useUserSearch(debouncedSearch);

  const users = staticUsers ?? searchedUsers ?? [];
  const selectedUser = users.find((u) => u.id === value);

  const handleSelect = (userId: string | undefined) => {
    onChange?.(userId);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('justify-between w-full font-normal', className)}
          disabled={disabled}
        >
          {selectedUser ? (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <UserAvatar user={selectedUser} size="xs" />
              <span className="truncate">{selectedUser.name}</span>
            </div>
          ) : (
            <span className="text-muted-foreground flex-1 text-left">
              {placeholder}
            </span>
          )}
          <div className="flex items-center gap-1 shrink-0">
            {clearable && value && (
              <span
                role="button"
                aria-label="Clear selection"
                className="rounded-sm hover:bg-muted p-0.5"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(undefined);
                }}
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </span>
            )}
            <ChevronsUpDown className="h-4 w-4 opacity-40" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search users..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <CommandEmpty>No users found.</CommandEmpty>
                <CommandGroup>
                  {clearable && (
                    <CommandItem
                      value="__unassigned__"
                      onSelect={() => handleSelect(undefined)}
                      className="text-muted-foreground"
                    >
                      Unassigned
                      {!value && <Check className="ml-auto h-4 w-4" />}
                    </CommandItem>
                  )}
                  {users.map((user) => (
                    <CommandItem
                      key={user.id}
                      value={`${user.name} ${user.email}`}
                      onSelect={() => handleSelect(user.id)}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <UserAvatar user={user} size="xs" />
                        <div className="min-w-0">
                          <p className="text-sm truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <Check
                        className={cn(
                          'h-4 w-4 shrink-0',
                          value === user.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
