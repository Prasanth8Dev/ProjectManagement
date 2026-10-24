'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpDown, Gauge } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { UserAvatar } from '@/components/shared/user-avatar';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { usePerformanceSummary } from '@/hooks/use-performance';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils/cn';
import type { EmployeePerformanceSummary } from '@/types/performance.types';

type SortKey =
  | 'name'
  | 'completionRate'
  | 'etaBreaches'
  | 'mistakesCount'
  | 'reworkCount'
  | 'interventionsCount';

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'name', label: 'Employee' },
  { key: 'completionRate', label: 'Completion' },
  { key: 'etaBreaches', label: 'ETA Breaches' },
  { key: 'mistakesCount', label: 'Mistakes / Bugs' },
  { key: 'reworkCount', label: 'Rework' },
  { key: 'interventionsCount', label: 'Interventions' },
];

function sortValue(row: EmployeePerformanceSummary, key: SortKey): number | string {
  switch (key) {
    case 'name':
      return row.user.name.toLowerCase();
    default:
      return row[key];
  }
}

function riskBadge(row: EmployeePerformanceSummary) {
  const riskScore = row.etaBreaches * 2 + row.reworkCount * 2 + row.interventionsCount + row.mistakesCount;
  if (riskScore === 0) {
    return <Badge variant="secondary">On track</Badge>;
  }
  if (riskScore <= 3) {
    return (
      <Badge className="border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
        Needs attention
      </Badge>
    );
  }
  return <Badge variant="destructive">At risk</Badge>;
}

export default function PerformanceDashboardPage() {
  const router = useRouter();
  const { data: summary, isLoading, isError } = usePerformanceSummary();
  const [sortKey, setSortKey] = useState<SortKey>('completionRate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const rows = useMemo(() => {
    const data = summary ?? [];
    const sorted = [...data].sort((a, b) => {
      const av = sortValue(a, sortKey);
      const bv = sortValue(b, sortKey);
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [summary, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'name' ? 'asc' : 'desc');
    }
  };

  const totals = useMemo(() => {
    const data = summary ?? [];
    return {
      etaBreaches: data.reduce((s, r) => s + r.etaBreaches, 0),
      reworkCount: data.reduce((s, r) => s + r.reworkCount, 0),
      interventionsCount: data.reduce((s, r) => s + r.interventionsCount, 0),
      mistakesCount: data.reduce((s, r) => s + r.mistakesCount, 0),
    };
  }, [summary]);

  if (isError) {
    return (
      <ErrorState
        title="Failed to load performance data"
        description="Something went wrong while fetching the performance dashboard."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee Performance"
        description="Completion rates, ETA breaches, mistakes, rework, and manager interventions across the team."
      />

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold">{totals.etaBreaches}</p>
              <p className="text-sm text-muted-foreground">Total ETA Breaches</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold">{totals.mistakesCount}</p>
              <p className="text-sm text-muted-foreground">Total Mistakes / Bugs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold">{totals.reworkCount}</p>
              <p className="text-sm text-muted-foreground">Total Rework Events</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold">{totals.interventionsCount}</p>
              <p className="text-sm text-muted-foreground">Total Interventions</p>
            </CardContent>
          </Card>
        </div>
      )}

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      )}

      {!isLoading && !isError && rows.length === 0 && (
        <EmptyState
          icon={Gauge}
          title="No performance data yet"
          description="Once employees are assigned tasks and bugs, their performance metrics will show up here."
        />
      )}

      {!isLoading && !isError && rows.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  {COLUMNS.map((col) => (
                    <TableHead key={col.key}>
                      <button
                        onClick={() => toggleSort(col.key)}
                        className={cn(
                          'flex items-center gap-1 hover:text-foreground transition-colors',
                          sortKey === col.key && 'text-foreground font-semibold'
                        )}
                      >
                        {col.label}
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </TableHead>
                  ))}
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow
                    key={row.user.id}
                    className="cursor-pointer"
                    onClick={() => router.push(ROUTES.PERFORMANCE_DETAIL(row.user.id))}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <UserAvatar user={row.user} size="sm" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{row.user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {row.user.jobTitle || row.user.role.replace(/_/g, ' ')}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 min-w-[140px]">
                        <Progress value={row.completionRate} className="h-2 w-24" />
                        <span className="text-sm text-muted-foreground shrink-0">
                          {row.completionRate}%
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {row.tasksCompleted}/{row.tasksAssigned} tasks
                      </p>
                    </TableCell>
                    <TableCell>
                      <span className={cn(row.etaBreaches > 0 && 'text-red-600 font-medium')}>
                        {row.etaBreaches}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={cn(row.mistakesCount > 0 && 'text-amber-600 font-medium')}>
                        {row.mistakesCount}
                      </span>
                      {row.bugsOpen > 0 && (
                        <span className="text-xs text-muted-foreground ml-1">
                          ({row.bugsOpen} open)
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={cn(row.reworkCount > 0 && 'text-orange-600 font-medium')}>
                        {row.reworkCount}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={cn(row.interventionsCount > 0 && 'text-purple-600 font-medium')}>
                        {row.interventionsCount}
                      </span>
                    </TableCell>
                    <TableCell>{riskBadge(row)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
