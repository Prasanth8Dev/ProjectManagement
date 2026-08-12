'use client';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/layout/page-header';
import { TeamMemberList } from '@/components/features/teams/team-member-list';
import { useTeam } from '@/hooks/use-teams';
import { Skeleton } from '@/components/ui/skeleton';

export default function TeamMembersPage() {
  const { id } = useParams<{ id: string }>();
  const { data: teamResp, isLoading } = useTeam(id);
  const team = teamResp?.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isLoading ? 'Members' : `${team?.name ?? 'Team'} — Members`}
        description="Manage who belongs to this team and their roles."
      />
      <TeamMemberList teamId={id} />
    </div>
  );
}
