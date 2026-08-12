'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Download, AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useDailyReport } from '@/hooks/use-reports';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

function exportToCSV(rows: any[], filename: string) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]).join(',');
  const body = rows
    .map((row) => Object.values(row).map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([`${headers}\n${body}`], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function DailyReportPage() {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const { data, isLoading, isError } = useDailyReport({ date });
  const report = data?.data;

  const summaryRows =
    report?.userSummaries?.map((u: any) => ({
      Name: u.user?.name ?? '—',
      Project: u.project?.name ?? '—',
      'Tasks Done': u.tasksDone ?? 0,
      'Hours Worked': u.hoursWorked ?? 0,
      Blockers: u.hasBlockers ? 'Yes' : 'No',
    })) ?? [];

  const blockedTasks = report?.blockedTasks ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daily Report"
        description="A day-level snapshot of team activity."
        actions={
          <Button
            variant="outline"
            onClick={() => exportToCSV(summaryRows, `daily-report-${date}.csv`)}
            disabled={!summaryRows.length}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        }
      />

      {/* Date Picker */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium">Date</label>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-44"
          max={format(new Date(), 'yyyy-MM-dd')}
        />
      </div>

      {isError && (
        <ErrorState title="Failed to load report" description="Please try again." />
      )}

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {/* Summary Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Summary for {format(new Date(date + 'T00:00:00'), 'MMMM d, yyyy')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {summaryRows.length === 0 ? (
                <p className="p-6 text-sm text-muted-foreground">
                  No updates submitted for this date.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Member</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead className="text-right">Tasks Done</TableHead>
                        <TableHead className="text-right">Hours</TableHead>
                        <TableHead>Blockers</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report?.userSummaries?.map((u: any, i: number) => (
                        <TableRow key={i}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="w-7 h-7">
                                <AvatarImage src={u.user?.avatar} />
                                <AvatarFallback className="text-xs">
                                  {u.user?.name?.charAt(0) ?? 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium">{u.user?.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{u.project?.name ?? '—'}</TableCell>
                          <TableCell className="text-right text-sm">{u.tasksDone ?? 0}</TableCell>
                          <TableCell className="text-right text-sm">{u.hoursWorked ?? 0}h</TableCell>
                          <TableCell>
                            {u.hasBlockers ? (
                              <Badge variant="destructive" className="text-xs">Yes</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">None</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Blocked Tasks */}
          {blockedTasks.length > 0 && (
            <Card className="border-orange-300">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-orange-700">
                  <AlertTriangle className="w-4 h-4" />
                  Blocked Tasks ({blockedTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Assignee</TableHead>
                      <TableHead>Blocker Note</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blockedTasks.map((bt: any) => (
                      <TableRow key={bt.id}>
                        <TableCell className="text-sm font-medium">{bt.title}</TableCell>
                        <TableCell className="text-sm">{bt.assignee?.name ?? '—'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {bt.blockerNote ?? '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
