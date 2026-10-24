'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Plus,
  Users,
  Trash2,
  Edit2,
  FileText,
  ListChecks,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { UserAvatar } from '@/components/shared/user-avatar';
import { useMeeting, useDeleteMeeting } from '@/hooks/use-meetings';
import { useToast } from '@/hooks/use-toast';
import { extractApiError } from '@/lib/utils/error';
import { MEETING_TYPE_CONFIG } from '@/constants/meeting-types';
import { ROUTES } from '@/constants/routes';
import { MomEditor } from '@/components/features/meetings/mom-editor';
import { MeetingForm } from '@/components/features/meetings/meeting-form';
import { ActionItemForm } from '@/components/features/meetings/action-item-form';
import { ActionItemCard } from '@/components/features/meetings/action-item-card';
import { cn } from '@/lib/utils/cn';

export default function MeetingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const { data: meeting, isLoading, isError } = useMeeting(id);
  const deleteMeeting = useDeleteMeeting();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addActionItemOpen, setAddActionItemOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteMeeting.mutateAsync(id);
      toast({ title: 'Meeting deleted' });
      if (meeting?.projectId) router.push(ROUTES.PROJECT_MEETINGS(meeting.projectId));
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: extractApiError(err) });
    }
  };

  if (isError) {
    return <ErrorState title="Failed to load meeting" description="Please try again." />;
  }

  if (isLoading || !meeting) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const typeCfg = MEETING_TYPE_CONFIG[meeting.type] ?? MEETING_TYPE_CONFIG.GENERAL;
  const actionItems = meeting.actionItems ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href={ROUTES.PROJECT_MEETINGS(meeting.projectId)}>
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Meetings
          </Link>
        </Button>
      </div>

      {/* Meeting header */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold truncate">{meeting.title}</h1>
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                    typeCfg.bgColor,
                    typeCfg.color
                  )}
                >
                  {typeCfg.label}
                </span>
              </div>
              {meeting.description && (
                <p className="text-muted-foreground mt-2">{meeting.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                <Edit2 className="w-4 h-4 mr-1.5" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {format(new Date(meeting.scheduledAt), 'MMM d, yyyy · h:mm a')}
            </span>
            {meeting.duration && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {meeting.duration} min
              </span>
            )}
            {meeting.organizer && (
              <span className="flex items-center gap-1.5">
                Organizer:
                <UserAvatar user={meeting.organizer} size="xs" />
                {meeting.organizer.name}
              </span>
            )}
          </div>

          {meeting.participants.length > 0 && (
            <div className="flex items-start gap-2">
              <Users className="w-4 h-4 text-muted-foreground mt-1" />
              <div className="flex flex-wrap gap-2">
                {meeting.participants.map((p) => (
                  <span
                    key={p.userId}
                    className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-1 text-xs"
                  >
                    <UserAvatar user={p.user} size="xs" />
                    {p.user.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MOM editor */}
      <Collapsible defaultOpen>
        <Card>
          <CardHeader className="py-3">
            <CollapsibleTrigger className="flex items-center gap-2 text-sm font-semibold w-full">
              <FileText className="w-4 h-4 text-muted-foreground" />
              Minutes of Meeting
              <ChevronDown className="w-4 h-4 text-muted-foreground ml-auto" />
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <MomEditor meeting={meeting} />
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Action items */}
      <Card>
        <CardHeader className="py-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-muted-foreground" />
              Action Items
            </CardTitle>
            <Button size="sm" onClick={() => setAddActionItemOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {actionItems.length === 0 ? (
            <EmptyState
              icon={ListChecks}
              title="No action items yet"
              description="Capture follow-ups and assign owners."
              action={{ label: 'Add Action Item', onClick: () => setAddActionItemOpen(true) }}
            />
          ) : (
            <div className="space-y-3">
              {actionItems.map((item) => (
                <ActionItemCard key={item.id} meetingId={meeting.id} actionItem={item} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <MeetingForm
        projectId={meeting.projectId}
        open={editOpen}
        onOpenChange={setEditOpen}
        meeting={meeting}
      />
      <ActionItemForm
        meetingId={meeting.id}
        open={addActionItemOpen}
        onOpenChange={setAddActionItemOpen}
      />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this meeting?"
        description="This deletes the meeting minutes and all its action items. This can't be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={deleteMeeting.isPending}
      />
    </div>
  );
}
