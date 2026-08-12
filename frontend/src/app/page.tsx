import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

// Root page: always send to dashboard.
// AuthGuard inside the dashboard layout handles the login redirect.
export default function RootPage() {
  redirect(ROUTES.DASHBOARD);
}
