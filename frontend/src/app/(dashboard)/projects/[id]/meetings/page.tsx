'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Video } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMeetings } from '@/hooks/use-meetings';
import { MeetingCard } from '@/components/features/meetings/meeting-card';
import { MeetingForm } from '@/components/features/meetings/meeting-form';
import { MEETING_TYPE_OPTIONS } from '@/constants/meeting-types';

export default function ProjectMeetingsPage() {
  const { id } = useParams<{ id: string }>();
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [formOpen, setFormOpen] = useState(false);

  const { data: meetings = [], isLoading, isError } = useMeetings(
    id,
    typeFilter === 'ALL' ? undefined : typeFilter
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Meetings"
        description="Meeting minutes, action items, and decisions for this project."
        actions={
          <div className="flex items-center gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All types</SelectItem>
                {MEETING_TYPE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Schedule Meeting
            </Button>
          </div>
        }
      />

      {isError && <ErrorState title="Failed to load meetings" description="Please try again." />}

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      )}

      {!isLoading && !isError && meetings.length === 0 && (
        <EmptyState
          icon={Video}
          title="No meetings yet"
          description="Schedule a meeting to start capturing minutes and action items."
          action={{ label: 'Schedule Meeting', onClick: () => setFormOpen(true) }}
        />
      )}

      {!isLoading && meetings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {meetings.map((m) => (
            <MeetingCard key={m.id} meeting={m} />
          ))}
        </div>
      )}

      <MeetingForm projectId={id} open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
