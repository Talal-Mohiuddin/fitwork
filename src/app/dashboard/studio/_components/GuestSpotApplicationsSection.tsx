'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Plane, Check, X, ChevronRight, Loader2, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { GuestSpotApplication, Profile } from '@/types';
import { 
  getStudioGuestSpotApplications, 
  updateGuestSpotApplicationStatus 
} from '@/services/guestSpotService';
import { Button } from '@/components/ui/button';

interface GuestSpotApplicationsSectionProps {
  studioId?: string;
}

export default function GuestSpotApplicationsSection({ studioId }: GuestSpotApplicationsSectionProps) {
  const [applications, setApplications] = useState<(GuestSpotApplication & { 
    applicant?: Profile; 
    guest_spot?: { title: string; start_date?: string; location?: string } 
  })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadApplications = useCallback(async () => {
    if (!studioId) return;

    try {
      setIsLoading(true);
      const data = await getStudioGuestSpotApplications(studioId);
      // Only show pending applications
      setApplications(data.filter(app => app.status === 'pending'));
    } catch (error) {
      console.error('Error loading guest spot applications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [studioId]);

  useEffect(() => {
    if (studioId) {
      loadApplications();
    }
  }, [studioId, loadApplications]);

  const handleUpdateStatus = async (applicationId: string, status: 'accepted' | 'rejected') => {
    setProcessingId(applicationId);
    try {
      await updateGuestSpotApplicationStatus(applicationId, status);
      // Remove from list
      setApplications(prev => prev.filter(app => app.id !== applicationId));
    } catch (error) {
      console.error('Error updating application status:', error);
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <Plane className="w-5 h-5 text-orange-500" />
          <h2 className="text-lg font-bold text-text-main dark:text-white">Guest Spot Applications</h2>
        </div>
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (applications.length === 0) {
    return null; // Don't show section if no pending applications
  }

  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Plane className="w-5 h-5 text-orange-500" />
          <h2 className="text-lg font-bold text-text-main dark:text-white">Guest Spot Applications</h2>
          <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-semibold px-2 py-0.5 rounded-full">
            {applications.length} Pending
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {applications.map((application) => (
          <div
            key={application.id}
            className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4"
          >
            <div className="flex items-start gap-4">
              {/* Applicant Photo */}
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden shrink-0">
                {application.applicant?.profile_photo ? (
                  <Image
                    src={application.applicant.profile_photo}
                    alt={application.applicant.full_name || 'Applicant'}
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <User className="w-6 h-6 text-gray-400" />
                )}
              </div>

              {/* Applicant Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link
                      href={`/instructors/${application.applicant_id}`}
                      className="font-semibold text-text-main dark:text-white hover:text-primary"
                    >
                      {application.applicant?.full_name || 'Unknown Applicant'}
                    </Link>
                    <p className="text-sm text-text-sub dark:text-gray-400">
                      {application.applicant?.headline || application.applicant?.fitness_styles?.join(', ') || 'Fitness Instructor'}
                    </p>
                  </div>
                  <span className="text-xs text-text-sub dark:text-gray-500 whitespace-nowrap">
                    {new Date(application.applied_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Guest Spot Info */}
                <div className="mt-2 text-sm">
                  <span className="text-text-sub dark:text-gray-400">Applied for: </span>
                  <span className="font-medium text-text-main dark:text-white">
                    {application.guest_spot?.title || 'Guest Spot'}
                  </span>
                </div>

                {/* Proposed Rate */}
                {application.proposed_rate && (
                  <div className="mt-1 text-sm">
                    <span className="text-text-sub dark:text-gray-400">Proposed rate: </span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {application.proposed_rate}
                    </span>
                  </div>
                )}

                {/* Message Preview */}
                {application.message && (
                  <p className="mt-2 text-sm text-text-sub dark:text-gray-400 line-clamp-2">
                    &ldquo;{application.message}&rdquo;
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateStatus(application.id, 'rejected')}
                    disabled={processingId === application.id}
                    className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                  >
                    {processingId === application.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <X className="w-4 h-4 mr-1" />
                        Decline
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleUpdateStatus(application.id, 'accepted')}
                    disabled={processingId === application.id}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {processingId === application.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Accept
                      </>
                    )}
                  </Button>
                  <Link href={`/instructors/${application.applicant_id}`}>
                    <Button size="sm" variant="ghost">
                      View Profile
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
