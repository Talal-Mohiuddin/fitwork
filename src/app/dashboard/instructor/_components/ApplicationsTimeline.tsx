'use client';

import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getInstructorApplications } from '@/services/jobService';
import { JobApplication } from '@/types';

interface ApplicationDisplay {
  id: string;
  studio: string;
  jobTitle: string;
  status: 'offered' | 'shortlisted' | 'applied' | 'rejected' | 'withdrawn';
  statusLabel: string;
  statusColor: string;
  action?: string;
  date: string;
}

interface ApplicationsTimelineProps {
  userId?: string;
}

export default function ApplicationsTimeline({ userId }: ApplicationsTimelineProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [applications, setApplications] = useState<ApplicationDisplay[]>([]);

  useEffect(() => {
    if (userId) {
      loadApplications();
    }
  }, [userId]);

  const loadApplications = async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      const data = await getInstructorApplications(userId);
      
      const formattedApplications: ApplicationDisplay[] = data.slice(0, 5).map((app: JobApplication & { job?: any }) => {
        const statusConfig = getStatusConfig(app.status);
        return {
          id: app.id,
          studio: app.job?.studio_name || 'Unknown Studio',
          jobTitle: app.job?.position || 'Position',
          status: app.status as ApplicationDisplay['status'],
          statusLabel: statusConfig.label,
          statusColor: statusConfig.color,
          action: app.status === 'offered' ? 'Review Offer' : undefined,
          date: formatDate(app.applied_at),
        };
      });
      
      setApplications(formattedApplications);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'offered':
        return {
          label: 'Offered',
          color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
        };
      case 'shortlisted':
        return {
          label: 'Shortlisted',
          color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
        };
      case 'applied':
      case 'pending':
        return {
          label: 'Applied',
          color: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
        };
      case 'rejected':
        return {
          label: 'Rejected',
          color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
        };
      case 'withdrawn':
        return {
          label: 'Withdrawn',
          color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
        };
      default:
        return {
          label: 'Applied',
          color: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return `${Math.floor(diffDays / 30)}mo ago`;
  };

  const statusDotColors: Record<string, string> = {
    offered: 'bg-yellow-400',
    shortlisted: 'bg-primary',
    applied: 'bg-slate-300 dark:bg-slate-600',
    pending: 'bg-slate-300 dark:bg-slate-600',
    rejected: 'bg-red-400',
    withdrawn: 'bg-gray-400',
  };

  return (
    <div className="bg-white dark:bg-[#1e293b] p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex-1">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-slate-900 dark:text-white text-base font-bold">
          Applications
        </h3>
        <a className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors" href="/jobs">
          View all
        </a>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-sm text-slate-500 dark:text-slate-400">No applications yet</p>
          <a href="/jobs" className="text-xs text-primary hover:underline mt-2 inline-block">
            Browse jobs
          </a>
        </div>
      ) : (
        /* Timeline */
        <div className="relative flex flex-col gap-6 pl-2 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-px before:bg-slate-200 dark:before:bg-slate-700">
          {applications.map((app) => (
            <div key={app.id} className="relative pl-8">
              {/* Timeline Dot */}
              <div
                className={`absolute left-[3px] top-1.5 size-2.5 rounded-full ring-4 ring-white dark:ring-[#1e293b] ${
                  statusDotColors[app.status] || 'bg-slate-300'
                }`}
              />

              {/* Content */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {app.studio}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {app.jobTitle}
                    </p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${app.statusColor}`}>
                    {app.statusLabel}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {app.action ? 'Action Required' : app.status === 'applied' ? 'Pending review' : 'Interview pending'} • {app.date}
                </p>
                {app.action && (
                  <button className="mt-2 text-xs font-medium text-white bg-primary hover:bg-green-700 px-3 py-1.5 rounded w-fit transition-colors">
                    {app.action}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
