'use client';

import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getJobs } from '@/services/jobService';
import { JobWithStudio } from '@/types';
import Link from 'next/link';

interface RecommendedSectionProps {
  userId?: string;
  userStyles?: string[];
}

export default function RecommendedSection({ userId, userStyles = [] }: RecommendedSectionProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [jobs, setJobs] = useState<JobWithStudio[]>([]);

  useEffect(() => {
    loadRecommendedJobs();
  }, [userId, userStyles]);

  const loadRecommendedJobs = async () => {
    try {
      setIsLoading(true);
      const { jobs: allJobs } = await getJobs({
        status: 'open',
        limitCount: 10,
      });
      
      // Filter by user's styles if available, otherwise show all
      let recommendedJobs = allJobs;
      if (userStyles.length > 0) {
        recommendedJobs = allJobs.filter(job => 
          job.styles?.some(style => userStyles.includes(style))
        );
      }
      
      // Take top 4
      setJobs(recommendedJobs.slice(0, 4));
    } catch (error) {
      console.error('Error loading recommended jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatRate = (compensation: string | number | undefined) => {
    if (!compensation) return 'Rate TBD';
    if (typeof compensation === 'number') return `$${compensation}`;
    return compensation;
  };

  if (isLoading) {
    return (
      <section>
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-slate-900 dark:text-white text-lg font-bold tracking-tight">
            Recommended for You
          </h2>
        </div>
        <div className="flex justify-center items-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </section>
    );
  }

  if (jobs.length === 0) {
    return (
      <section>
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-slate-900 dark:text-white text-lg font-bold tracking-tight">
            Recommended for You
          </h2>
        </div>
        <div className="bg-white dark:bg-[#1e293b] p-8 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
          <p className="text-slate-500 dark:text-slate-400 mb-2">No recommended jobs right now</p>
          <Link href="/jobs" className="text-primary text-sm font-medium hover:underline">
            Browse all jobs
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex justify-between items-end mb-4">
        <h2 className="text-slate-900 dark:text-white text-lg font-bold tracking-tight">
          Recommended for You
        </h2>
        <Link className="text-primary text-sm font-medium hover:text-green-700 transition-colors" href="/jobs">
          See All
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="bg-white dark:bg-[#1e293b] p-5 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div
                className="size-10 rounded-full bg-cover bg-center border border-slate-100 dark:border-slate-700 bg-primary/10 flex items-center justify-center"
                style={job.studio.images?.[0] ? { backgroundImage: `url(${job.studio.images[0]})` } : {}}
              >
                {!job.studio.images?.[0] && (
                  <span className="text-primary font-bold text-sm">
                    {job.studio.name?.charAt(0) || 'S'}
                  </span>
                )}
              </div>
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold px-2 py-1 rounded-md">
                {formatRate(job.compensation)}
              </span>
            </div>

            <h3 className="text-slate-900 dark:text-white font-bold text-base mb-1">
              {job.position}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
              {job.studio.name || 'Studio'} • {job.studio.location || 'Location TBD'}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {job.styles?.slice(0, 2).map((style) => (
                <span
                  key={style}
                  className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded"
                >
                  {style}
                </span>
              ))}
              {job.urgent && (
                <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded">
                  Urgent
                </span>
              )}
            </div>

            <Link 
              href={`/jobs?apply=${job.id}`}
              className="w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary font-medium text-sm rounded-lg transition-colors text-center block"
            >
              Quick Apply
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
