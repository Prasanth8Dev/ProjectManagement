'use client';
import Link from 'next/link';
import { Users, FolderKanban } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Team } from '@/types/team.types';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils/cn';

interface TeamCardProps {
  team: Team;
  className?: string;
}

export function TeamCard({ team, className }: TeamCardProps) {
  return (
    <Link href={ROUTES.TEAM(team.id)}>
      <motion.div
        whileHover={{ scale: 1.01, y: -2 }}
        transition={{ duration: 0.15 }}
      >
        <Card
          className={cn(
            'hover:shadow-md transition-shadow cursor-pointer h-full border-l-4',
            className
          )}
          style={{ borderLeftColor: team.color }}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start gap-3">
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 text-white font-bold text-lg"
                style={{ backgroundColor: team.color }}
              >
                {team.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base leading-tight truncate">{team.name}</h3>
                {team.description && (
                  <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                    {team.description}
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                <span>
                  {team._count?.members ?? 0}{' '}
                  {(team._count?.members ?? 0) === 1 ? 'member' : 'members'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <FolderKanban className="h-4 w-4" />
                <span>
                  {team._count?.projects ?? 0}{' '}
                  {(team._count?.projects ?? 0) === 1 ? 'project' : 'projects'}
                </span>
              </div>
            </div>

            {/* Member avatars preview */}
            {team.members && team.members.length > 0 && (
              <div className="mt-3 flex items-center">
                <div className="flex -space-x-2">
                  {team.members.slice(0, 4).map((member) => (
                    <div
                      key={member.id}
                      className="h-6 w-6 rounded-full border-2 border-background flex items-center justify-center text-[9px] font-bold text-white"
                      style={{ backgroundColor: team.color + 'cc' }}
                      title={member.user.name}
                    >
                      {member.user.name.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {team.members.length > 4 && (
                    <div className="h-6 w-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[9px] font-medium text-muted-foreground">
                      +{team.members.length - 4}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}
