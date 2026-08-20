import { useAuthStore } from '@/stores/auth.store';

/**
 * Axios `params` fragment identifying who is performing a mutating request.
 * The backend uses this (where supported) to attribute history/activity log
 * entries and to know who to skip when firing notifications (so you never
 * get notified about your own actions). Safe to spread into any request
 * config — resolves to `{}` if nobody's logged in.
 */
export function actorParams(): { actorUserId?: string } {
  const id = useAuthStore.getState().currentUser?.id;
  return id ? { actorUserId: id } : {};
}
