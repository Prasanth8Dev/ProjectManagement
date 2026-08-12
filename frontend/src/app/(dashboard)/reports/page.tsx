'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { CalendarDays, BarChart3, FolderKanban, User } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';

const REPORT_CARDS = [
  {
    icon: CalendarDays,
    title: 'Daily Report',
    description: 'View a snapshot of all team activity for any given day — tasks completed, hours worked, and blockers.',
    href: ROUTES.REPORTS_DAILY,
    color: 'text-blue-600 bg-blue-50',
  },
  {
    icon: BarChart3,
    title: 'Weekly Report',
    description: 'Analyse team performance over any week — completed tasks, hours logged, and update submissions.',
    href: ROUTES.REPORTS_WEEKLY,
    color: 'text-green-600 bg-green-50',
  },
  {
    icon: FolderKanban,
    title: 'Project Report',
    description: 'Dive into a project\'s health: completion rate, milestone progress, overdue tasks, and contributions.',
    href: ROUTES.PROJECTS,
    color: 'text-purple-600 bg-purple-50',
  },
  {
    icon: User,
    title: 'Employee Report',
    description: 'Review an individual\'s performance: tasks completed, hours tracked, and update history.',
    href: ROUTES.MEMBERS,
    color: 'text-orange-600 bg-orange-50',
  },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Insights and analytics across your team and projects."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {REPORT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${card.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{card.title}</CardTitle>
                    <CardDescription className="mt-1 leading-relaxed">
                      {card.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <Link href={card.href}>View Report</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
