'use client';
import { useState } from 'react';
import { UserPlus, Shield, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/shared/user-avatar';
import { UserSelect } from '@/components/shared/user-select';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useTeamMembers,
  useAddTeamMember,
  useRemoveTeamMember,
  useChangeTeamMemberRole as useUpdateTeamMemberRole,
} from '@/hooks/use-teams';
import { formatDate } from '@/lib/utils/date';
import { toast } from '@/components/ui/use-toast';
import type { TeamMember } from '@/types/team.types';
import { cn } from '@/lib/utils/cn';

const ROLE_OPTIONS = [
  { value: 'MEMBER', label: 'Member' },
  { value: 'LEAD', label: 'Lead' },
  { value: 'VIEWER', label: 'Viewer' },
];

const ROLE_COLORS: Record<string, string> = {
  LEAD: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  MEMBER: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  VIEWER: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

interface TeamMemberListProps {
  teamId: string;
}

export function TeamMemberList({ teamId }: TeamMemberListProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addUserId, setAddUserId] = useState<string | undefined>();
  const [addRole, setAddRole] = useState('MEMBER');
  const [removeTarget, setRemoveTarget] = useState<TeamMember | null>(null);

  const { data: members, isLoading } = useTeamMembers(teamId);
  const { mutate: addMember, isPending: isAdding } = useAddTeamMember(teamId);
  const { mutate: removeMember, isPending: isRemoving } = useRemoveTeamMember(teamId);
  const { mutate: updateRole } = useUpdateTeamMemberRole(teamId);

  const handleAddMember = () => {
    if (!addUserId) return;
    addMember(
      { userId: addUserId, role: addRole as 'LEAD' | 'MEMBER' },
      {
        onSuccess: () => {
          toast({ title: 'Member added to team' });
          setShowAddDialog(false);
          setAddUserId(undefined);
          setAddRole('MEMBER');
        },
        onError: () => toast({ title: 'Failed to add member', variant: 'destructive' }),
      }
    );
  };

  const handleRemoveMember = () => {
    if (!removeTarget) return;
    removeMember(
      removeTarget.userId,
      {
        onSuccess: () => {
          toast({ title: 'Member removed from team' });
          setRemoveTarget(null);
        },
        onError: () => toast({ title: 'Failed to remove member', variant: 'destructive' }),
      }
    );
  };

  const handleRoleChange = (member: TeamMember, role: string) => {
    updateRole(
      { memberId: member.id, role: role as 'LEAD' | 'MEMBER' },
      {
        onSuccess: () => toast({ title: 'Role updated' }),
        onError: () => toast({ title: 'Failed to update role', variant: 'destructive' }),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-8 w-24" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Add button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {members?.length ?? 0} {members?.length === 1 ? 'member' : 'members'}
        </p>
        <Button size="sm" onClick={() => setShowAddDialog(true)}>
          <UserPlus className="h-4 w-4 mr-1.5" />
          Add Member
        </Button>
      </div>

      {/* Members Table */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!members || members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No members yet. Add someone to get started.
                </TableCell>
              </TableRow>
            ) : (
              (members as any[]).map((member: any) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <UserAvatar user={member.user} size="sm" />
                      <div>
                        <p className="text-sm font-medium">{member.user.name}</p>
                        {member.isLead && (
                          <p className="text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1">
                            <Shield className="h-3 w-3" /> Team Lead
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {member.user.email}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={member.role}
                      onValueChange={(role) => handleRoleChange(member, role)}
                    >
                      <SelectTrigger className="h-7 w-28 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value} className="text-xs">
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(member.joinedAt, 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setRemoveTarget(member)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Member Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">User</label>
              <UserSelect
                value={addUserId}
                onChange={setAddUserId}
                placeholder="Search for a user..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select value={addRole} onValueChange={setAddRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMember} disabled={!addUserId} loading={isAdding}>
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation Dialog */}
      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
        title="Remove Member"
        description={`Are you sure you want to remove ${removeTarget?.user.name} from this team? They will lose access to team projects.`}
        confirmLabel="Remove"
        variant="destructive"
        onConfirm={handleRemoveMember}
      />
    </div>
  );
}
