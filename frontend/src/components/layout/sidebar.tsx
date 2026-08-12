'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FolderKanban, CheckSquare, Users, FileText,
  BarChart3, Search, UserCircle, ChevronLeft, ChevronRight, Bug
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useUIStore } from '@/stores/ui.store';
import { useAuthStore } from '@/stores/auth.store';
import { ThemeToggle } from './theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ROUTES } from '@/constants/routes';
import type { UserRole } from '@/types/user.types';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: UserRole[]; // undefined = all roles
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: 'Projects',  href: ROUTES.PROJECTS,  icon: FolderKanban },
  { label: 'Tasks',     href: ROUTES.TASKS,     icon: CheckSquare },
  { label: 'Bugs',      href: ROUTES.BUGS,      icon: Bug },
  {
    label: 'Teams', href: ROUTES.TEAMS, icon: Users,
    roles: ['ADMIN', 'MANAGER'],
  },
  { label: 'Updates',  href: ROUTES.UPDATES,  icon: FileText },
  {
    label: 'Reports', href: ROUTES.REPORTS, icon: BarChart3,
    roles: ['ADMIN', 'MANAGER'],
  },
  {
    label: 'Members', href: ROUTES.MEMBERS, icon: UserCircle,
    roles: ['ADMIN', 'MANAGER', 'PROJECT_MANAGER'],
  },
  { label: 'Search', href: ROUTES.SEARCH, icon: Search },
];

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

export function Sidebar() {
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const pathname = usePathname();
  const currentUser = useAuthStore((s) => s.currentUser);

  const role = currentUser?.role as UserRole | undefined;

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || (role && item.roles.includes(role))
  );

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        animate={{ width: isSidebarOpen ? 240 : 64 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="relative flex h-screen flex-shrink-0 flex-col border-r bg-card overflow-hidden"
      >
        {/* Logo */}
        <div className="flex h-16 items-center border-b px-3">
          <div className="flex items-center gap-2 overflow-hidden min-w-0">
            {/* Collapsed: show flame icon only */}
            {!isSidebarOpen && (
              <div className="flex-shrink-0 w-8 h-8 relative">
                <Image
                  src="/gritsys-icon.svg"
                  alt="Gritsys"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            )}
            {/* Expanded: show full logo PNG */}
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }}
                  className="relative h-10 w-40 flex-shrink-0"
                >
                  <Image
                    src="/gritsys-logo.png"
                    alt="Gritsys Technologies"
                    fill
                    className="object-contain object-left"
                    priority
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));

            const linkContent = (
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <AnimatePresence>
                  {isSidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.12 }}
                      className="whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );

            if (!isSidebarOpen) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            }

            return <div key={item.href}>{linkContent}</div>;
          })}
        </nav>

        {/* Footer — real user */}
        <div className="border-t p-2 space-y-2">
          <div className="flex items-center justify-between px-1">
            <ThemeToggle />
          </div>

          <div className={cn(
            'flex items-center gap-3 rounded-md px-2 py-2',
            isSidebarOpen ? '' : 'justify-center'
          )}>
            <Avatar className="h-7 w-7 flex-shrink-0">
              <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {getInitials(currentUser?.name ?? 'U')}
              </AvatarFallback>
            </Avatar>
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="overflow-hidden"
                >
                  <p className="text-xs font-medium truncate">{currentUser?.name ?? '—'}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {currentUser?.role?.replace(/_/g, ' ') ?? ''}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-sm hover:bg-accent transition-colors z-10"
        >
          {isSidebarOpen ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </button>
      </motion.aside>
    </TooltipProvider>
  );
}
