'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { getStudioJobs } from '@/services/jobService';
import { JobWithStudio } from '@/types';
import Link from 'next/link';

interface OpenShiftsSectionProps {
  studioId?: string;
}

export default function OpenShiftsSection({ studioId }: OpenShiftsSectionProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [shifts, setShifts] = useState<JobWithStudio[]>([]);

  useEffect(() => {
    if (studioId) {
      loadShifts();
    }
  }, [studioId]);

  const loadShifts = async () => {
    if (!studioId) return;
    
    try {
      setIsLoading(true);
      const { jobs } = await getStudioJobs(studioId);
      // Filter to only show open jobs
      const openJobs = jobs.filter(job => job.status === 'open');
      setShifts(openJobs.slice(0, 5));
    } catch (error) {
      console.error('Error loading shifts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'long' });
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getStyleColor = (style: string) => {
    const colors: Record<string, string> = {
      'Yoga': 'bg-blue-500',
      'HIIT': 'bg-orange-500',
      'Pilates': 'bg-purple-500',
      'Cycling': 'bg-green-500',
      'Boxing': 'bg-red-500',
      'Dance': 'bg-pink-500',
      'Strength': 'bg-yellow-500',
      'Barre': 'bg-indigo-500',
    };
    return colors[style] || 'bg-gray-500';
  };

  return (
    <section className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-border-light dark:border-border-dark flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/20">
        <div className="flex items-center gap-2">
          <AlertCircle size={20} className="text-orange-500" />
          <div>
            <h2 className="text-lg font-bold text-text-main dark:text-white">
              Open Shifts
            </h2>
            <span className="text-text-sub font-normal text-sm">
              ({shifts.length} positions)
            </span>
          </div>
        </div>
        <Link href="/jobs" className="text-primary text-sm font-semibold hover:underline transition-colors">
          View All
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : shifts.length === 0 ? (
        <div className="text-center py-10 px-6">
          <p className="text-text-sub dark:text-gray-400 mb-2">No open shifts right now</p>
          <Link href="/jobs/post" className="text-primary text-sm font-medium hover:underline">
            Post a new gig
          </Link>
        </div>
      ) : (
        /* Table */
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-light dark:border-border-dark text-text-sub dark:text-gray-400 text-sm">
                <th className="px-6 py-4 font-medium w-1/4">Date</th>
                <th className="px-6 py-4 font-medium w-1/4">Position</th>
                <th className="px-6 py-4 font-medium w-1/6">Status</th>
                <th className="px-6 py-4 font-medium w-1/4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-gray-800">
              {shifts.map((shift) => (
                <tr
                  key={shift.id}
                  className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="text-text-main dark:text-white font-medium text-sm">
                      {shift.start_date ? formatDate(shift.start_date) : 'TBD'}
                    </p>
                    <p className="text-text-sub text-xs">{shift.compensation || 'Rate TBD'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`size-2 rounded-full ${getStyleColor(shift.styles?.[0] || '')}`} />
                      <span className="text-text-main dark:text-white text-sm">
                        {shift.position}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        shift.urgent
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                      }`}
                    >
                      {shift.urgent ? 'Urgent' : 'Open'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      href={`/instructors?hire=${shift.id}`}
                      className="inline-flex items-center justify-center px-4 py-2 bg-surface-light border border-border-light rounded-lg text-sm font-medium text-text-main hover:bg-gray-50 dark:bg-transparent dark:border-gray-600 dark:text-white dark:hover:bg-gray-800 transition-colors"
                    >
                      Find Sub
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
