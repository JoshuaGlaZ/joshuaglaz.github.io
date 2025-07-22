import React from 'react';
import { motion } from 'framer-motion';

export const LoadingSkeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-pulse bg-zinc-800/50 rounded ${className}`} />
);

export const ProjectCardSkeleton: React.FC = () => (
  <div className="p-4 md:p-8 space-y-4">
    <div className="flex justify-between items-center">
      <LoadingSkeleton className="h-4 w-20" />
      <LoadingSkeleton className="h-4 w-12" />
    </div>
    <LoadingSkeleton className="h-8 w-3/4" />
    <LoadingSkeleton className="h-20 w-full" />
  </div>
);

export function ProjectSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div className="h-4 w-20 bg-zinc-800/50 rounded animate-pulse" />
        <div className="h-4 w-12 bg-zinc-800/50 rounded animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="h-8 w-3/4 bg-zinc-800/50 rounded animate-pulse" />
        <div className="h-4 w-full bg-zinc-800/50 rounded animate-pulse" />
        <div className="h-4 w-2/3 bg-zinc-800/50 rounded animate-pulse" />
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, staggerChildren: 0.1 }}
        className="space-y-2"
      >
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="h-4 bg-zinc-800/30 rounded animate-pulse"
            style={{ width: `${100 - i * 10}%` }}
          />
        ))}
      </motion.div>
    </div>
  );
}