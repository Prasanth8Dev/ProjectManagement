'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <motion.h1
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="text-[10rem] font-extrabold leading-none text-primary/20 select-none"
        >
          404
        </motion.h1>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
          Page not found
        </h2>
        <p className="mt-4 text-muted-foreground text-base leading-relaxed">
          Sorry, we couldn&apos;t find the page you were looking for. It may have
          been moved, deleted, or never existed.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg">
            <Link href={ROUTES.DASHBOARD}>Go to Dashboard</Link>
          </Button>
          <Button variant="outline" size="lg" onClick={() => window.history.back()}>
            Go back
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
