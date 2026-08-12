'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { getInitials } from '@/lib/utils/format';
import { User } from '@/types/user.types';
import { cn } from '@/lib/utils/cn';

interface UserAvatarProps {
  user: Pick<User, 'name' | 'avatar'>;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showTooltip?: boolean;
  className?: string;
}

const sizeClasses: Record<NonNullable<UserAvatarProps['size']>, string> = {
  xs: 'h-5 w-5 text-[9px]',
  sm: 'h-7 w-7 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-11 w-11 text-base',
  xl: 'h-14 w-14 text-lg',
};

export function UserAvatar({
  user,
  size = 'md',
  showTooltip = false,
  className,
}: UserAvatarProps) {
  const avatar = (
    <Avatar className={cn(sizeClasses[size], className)}>
      {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
      <AvatarFallback className={sizeClasses[size]}>
        {getInitials(user.name)}
      </AvatarFallback>
    </Avatar>
  );

  if (!showTooltip) return avatar;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>{avatar}</TooltipTrigger>
        <TooltipContent side="top">{user.name}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
