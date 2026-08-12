import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  FileText,
  BarChart3,
  Search,
  UserCircle,
} from 'lucide-react';
import { ROUTES } from './routes';

export const NAV_ITEMS = [
  { label: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: 'Projects', href: ROUTES.PROJECTS, icon: FolderKanban },
  { label: 'Tasks', href: ROUTES.TASKS, icon: CheckSquare },
  { label: 'Teams', href: ROUTES.TEAMS, icon: Users },
  { label: 'Updates', href: ROUTES.UPDATES, icon: FileText },
  { label: 'Reports', href: ROUTES.REPORTS, icon: BarChart3 },
  { label: 'Members', href: ROUTES.MEMBERS, icon: UserCircle },
  { label: 'Search', href: ROUTES.SEARCH, icon: Search },
] as const;
