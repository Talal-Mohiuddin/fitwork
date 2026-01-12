'use client';

import React, { useEffect, useState } from 'react';
import { Star, Calendar, Loader2, Check, X } from 'lucide-react';
import { getStudioApplications, updateApplicationStatus } from '@/services/jobService';
import { JobApplication, Profile } from '@/types';
import Link from 'next/link';

interface ApplicationWithApplicant extends JobApplication {
  applicant?: Profile;
  job?: {
    position: string;
    start_date?: string;
  };
}

interface PendingApplicationsSectionProps {
  studioId?: string;
}

export default function PendingApplicationsSection({ studioId }: PendingApplicationsSectionProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [applications, setApplications] = useState<ApplicationWithApplicant[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (studioId) {
      loadApplications();
    }
  }, [studioId]);

  const loadApplications = async () => {
    if (!studioId) return;
    
    try {
      setIsLoading(true);
      const apps = await getStudioApplications(studioId);
      // Filter to show only pending applications
      const pendingApps = apps.filter(app => app.status === 'pending');
      setApplications(pendingApps.slice(0, 4));
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (applicationId: string) => {
    try {
      setProcessingId(applicationId);
      await updateApplicationStatus(applicationId, 'accepted');
      // Remove from list
      setApplications(prev => prev.filter(app => app.id !== applicationId));
    } catch (error) {
      console.error('Error approving application:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (applicationId: string) => {
    try {
      setProcessingId(applicationId);
      await updateApplicationStatus(applicationId, 'rejected');
      // Remove from list
      setApplications(prev => prev.filter(app => app.id !== applicationId));
    } catch (error) {
      console.error('Error rejecting application:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const formatAppliedTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <section>
        <div className="flex justify-between items-center mb-4 px-1">
          <h2 className="text-lg font-bold text-text-main dark:text-white">
            Pending Applications
          </h2>
        </div>
        <div className="flex justify-center items-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex justify-between items-center mb-4 px-1">
        <h2 className="text-lg font-bold text-text-main dark:text-white">
          Pending Applications
        </h2>
        <span className="text-xs font-medium text-text-sub bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
          {applications.length} New
        </span>
      </div>

      {applications.length === 0 ? (
        <div className="bg-surface-light dark:bg-surface-dark p-8 rounded-xl border border-border-light dark:border-border-dark text-center">
          <p className="text-text-sub dark:text-gray-400 mb-2">No pending applications</p>
          <Link href="/jobs/post/wizard" className="text-primary text-sm font-medium hover:underline">
            Post a job to get applicants
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-surface-light dark:bg-surface-dark p-5 rounded-xl border border-border-light dark:border-border-dark shadow-sm flex flex-col gap-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <div
                    className="size-12 rounded-full bg-cover bg-center bg-primary/10 flex items-center justify-center"
                    style={app.applicant?.images?.[0] ? { backgroundImage: `url(${app.applicant.images[0]})` } : {}}
                  >
                    {!app.applicant?.images?.[0] && (
                      <span className="text-primary font-bold">
                        {app.applicant?.full_name?.charAt(0) || 'U'}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-main dark:text-white">
                      {app.applicant?.full_name || 'Applicant'}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-text-sub mt-0.5">
                      <Star size={14} className="text-yellow-500 fill-yellow-500" />
                      <span className="font-medium text-text-main dark:text-gray-300">
                        {app.applicant?.rating || 'New'}
                      </span>
                      <span>• {app.applicant?.experience_years ? `${app.applicant.experience_years}+ years` : 'New Talent'}</span>
                    </div>
                  </div>
                </div>
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                  Applied {formatAppliedTime(app.applied_at)}
                </span>
              </div>

              {/* Position */}
              <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                <p className="text-xs text-text-sub mb-1">Applying for:</p>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-text-main dark:text-white" />
                  <span className="text-sm font-medium text-text-main dark:text-white">
                    {app.job?.position || 'Position'}
                    {app.job?.start_date && ` • ${new Date(app.job.start_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 mt-auto">
                <Link 
                  href={`/instructors/${app.applicant_id}`}
                  className="flex items-center justify-center h-9 px-3 rounded-lg border border-border-light dark:border-gray-600 text-sm font-medium text-text-main dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  View Profile
                </Link>
                <button 
                  onClick={() => handleApprove(app.id)}
                  disabled={processingId === app.id}
                  className="flex items-center justify-center gap-1 h-9 px-3 rounded-lg bg-primary hover:bg-primary-dark text-sm font-medium text-white shadow-sm transition-colors disabled:opacity-50"
                >
                  {processingId === app.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Check size={16} />
                      Approve
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
