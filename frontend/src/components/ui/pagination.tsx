'use client';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

// ── Simple compound-component API (used by most pages) ────────────────────────

interface PaginationProps {
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  className?: string;
  children?: React.ReactNode;
}

export function Pagination({ page = 1, totalPages = 1, onPageChange, className, children }: PaginationProps) {
  if (children) {
    return <nav className={cn('flex items-center gap-1', className)} aria-label="Pagination">{children}</nav>;
  }
  if (totalPages <= 1) return null;

  const getPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1) as (number | 'ellipsis')[];
    const pages: (number | 'ellipsis')[] = [1];
    if (page > 3) pages.push('ellipsis');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push('ellipsis');
    pages.push(totalPages);
    return pages;
  };

  return (
    <nav className={cn('flex items-center gap-1', className)} aria-label="Pagination">
      <Button variant="outline" size="sm" onClick={() => onPageChange?.(page - 1)} disabled={page <= 1} aria-label="Previous page">
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {getPages().map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`e-${i}`} className="px-2 text-muted-foreground"><MoreHorizontal className="h-4 w-4" /></span>
        ) : (
          <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" onClick={() => onPageChange?.(p)} className="w-9">{p}</Button>
        )
      )}
      <Button variant="outline" size="sm" onClick={() => onPageChange?.(page + 1)} disabled={page >= totalPages} aria-label="Next page">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}

// ── ShadCN-style sub-component API (used by tasks/projects pages) ─────────────

import * as React from 'react';

export function PaginationContent({ className, children, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return <ul className={cn('flex items-center gap-1', className)} {...props}>{children}</ul>;
}

export function PaginationItem({ className, children, ...props }: React.HTMLAttributes<HTMLLIElement>) {
  return <li className={cn('', className)} {...props}>{children}</li>;
}

export function PaginationPrevious({
  className, onClick, ...props
}: React.HTMLAttributes<HTMLButtonElement> & { 'aria-disabled'?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1 px-3 h-9 text-sm rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors',
        className
      )}
      {...props}
    >
      <ChevronLeft className="h-4 w-4" />
      Previous
    </button>
  );
}

export function PaginationNext({
  className, onClick, ...props
}: React.HTMLAttributes<HTMLButtonElement> & { 'aria-disabled'?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1 px-3 h-9 text-sm rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors',
        className
      )}
      {...props}
    >
      Next
      <ChevronRight className="h-4 w-4" />
    </button>
  );
}
