'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { ROUTES } from '@/constants/routes';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.currentUser);
  const clearUser   = useAuthStore((s) => s.clearUser);

  // Detect stale/bad session: object exists but `id` is missing
  // (happens when the NestJS wrapper was accidentally stored as currentUser)
  const isValidSession = !!currentUser?.id;

  useEffect(() => {
    if (!currentUser) {
      router.replace(ROUTES.LOGIN);
      return;
    }
    if (!isValidSession) {
      // Clear corrupted session (e.g. NestJS wrapper stored instead of user)
      clearUser();
      router.replace(ROUTES.LOGIN);
    }
  }, [currentUser, isValidSession, clearUser, router]);

  if (!currentUser || !isValidSession) return null;

  return <>{children}</>;
}
