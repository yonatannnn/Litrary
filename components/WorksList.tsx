'use client';

import WorkCard from './WorkCard';
import { Work } from '@/types/work';

interface WorksListProps {
  works: Work[];
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
}

export default function WorksList({ works, emptyMessage, emptyAction }: WorksListProps) {
  if (works.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg shadow">
        {emptyMessage && (
          <p className="text-gray-600 dark:text-gray-400 mb-4">{emptyMessage}</p>
        )}
        {emptyAction}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {works.map((work) => (
        <WorkCard key={work._id} work={work} />
      ))}
    </div>
  );
}

