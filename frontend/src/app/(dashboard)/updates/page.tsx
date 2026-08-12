'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Plus, FileText } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UpdateCard } from '@/components/features/updates/update-card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useDailyUpdates } from '@/hooks/use-updates';
import { useMembers } from '@/hooks/use-members';
import { useTeams } from '@/hooks/use-teams';
import { ROUTES } from '@/constants/routes';

const PAGE_SIZE = 15;

export default function UpdatesPage() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [date, setDate] = useState('');
  const [teamId, setTeamId] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useDailyUpdates({
    userId: userId || undefined,
    date: date || undefined,
    teamId: teamId || undefined,
    page,
    limit: PAGE_SIZE,
  });

  const { data: membersResp } = useMembers();
  const { data: teamsResp } = useTeams();

  const updates = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const members = membersResp?.data ?? [];
  const teams = teamsResp?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daily Updates"
        description="Track team progress through daily check-ins."
        actions={
          <Button asChild>
            <Link href={ROUTES.UPDATE_NEW}>
              <Plus className="w-4 h-4 mr-2" />
              Submit Today's Update
            </Link>
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select
          value={userId || 'all'}
          onValueChange={(v) => { setUserId(v === 'all' ? '' : v); setPage(1); }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All Members" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Members</SelectItem>
            {members.map((m: any) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={date}
          onChange={(e) => { setDate(e.target.value); setPage(1); }}
          className="w-44"
        />

        <Select
          value={teamId || 'all'}
          onValueChange={(v) => { setTeamId(v === 'all' ? '' : v); setPage(1); }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All Teams" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Teams</SelectItem>
            {teams.map((t: any) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(userId || date || teamId) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setUserId(''); setDate(''); setTeamId(''); setPage(1); }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {isError && (
        <ErrorState title="Failed to load updates" description="Something went wrong." />
      )}

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      )}

      {!isLoading && !isError && updates.length === 0 && (
        <EmptyState
          icon={FileText}
          title="No updates found"
          description="Submit your first daily update to get started."
          action={{ label: 'Submit Update', onClick: () => router.push(ROUTES.UPDATE_NEW) }}
        />
      )}

      {!isLoading && !isError && updates.length > 0 && (
        <>
          <div className="space-y-4">
            {updates.map((update: any) => (
              <UpdateCard key={update.id} update={update} />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage(Math.max(1, page - 1))}
                    aria-disabled={page <= 1}
                    className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                <PaginationItem>
                  <span className="text-sm text-muted-foreground px-4">
                    Page {page} of {totalPages}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    aria-disabled={page >= totalPages}
                    className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
}
