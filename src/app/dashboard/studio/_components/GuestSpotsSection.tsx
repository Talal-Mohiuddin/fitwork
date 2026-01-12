'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Plane, Calendar, MapPin, Users, ChevronRight, Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { GuestSpotWithStudio } from '@/types';
import { getStudioGuestSpots } from '@/services/guestSpotService';

interface GuestSpotsSectionProps {
  studioId?: string;
}

const durationLabels: Record<string, string> = {
  single_class: "Single Class",
  workshop: "Workshop",
  weekend: "Weekend",
  week: "Week",
  retreat: "Retreat",
  series: "Series",
};

export default function GuestSpotsSection({ studioId }: GuestSpotsSectionProps) {
  const [guestSpots, setGuestSpots] = useState<GuestSpotWithStudio[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadGuestSpots = useCallback(async () => {
    if (!studioId) return;

    try {
      setIsLoading(true);
      const { guestSpots: data } = await getStudioGuestSpots(studioId);
      // Only show open guest spots
      setGuestSpots(data.filter(gs => gs.status === 'open'));
    } catch (error) {
      console.error('Error loading guest spots:', error);
    } finally {
      setIsLoading(false);
    }
  }, [studioId]);

  useEffect(() => {
    if (studioId) {
      loadGuestSpots();
    }
  }, [studioId, loadGuestSpots]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Plane className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-text-main dark:text-white">Guest Spots</h2>
          </div>
        </div>
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Plane className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-text-main dark:text-white">Guest Spots</h2>
          {guestSpots.length > 0 && (
            <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">
              {guestSpots.length} Open
            </span>
          )}
        </div>
        <Link
          href="/guest-spots/post"
          className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          Post New
        </Link>
      </div>

      {guestSpots.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plane className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="text-sm font-medium text-text-main dark:text-white mb-2">
            No Active Guest Spots
          </h3>
          <p className="text-sm text-text-sub dark:text-gray-400 mb-4">
            Create a guest spot to find traveling instructors
          </p>
          <Link
            href="/guest-spots/post"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Post Guest Spot
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {guestSpots.slice(0, 3).map((guestSpot) => (
            <Link
              key={guestSpot.id}
              href={`/guest-spots/${guestSpot.id}`}
              className="block bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded-full">
                      {durationLabels[guestSpot.duration_type] || guestSpot.duration_type}
                    </span>
                  </div>
                  <h3 className="font-semibold text-text-main dark:text-white truncate">
                    {guestSpot.title}
                  </h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-text-sub dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {guestSpot.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(guestSpot.start_date)} - {formatDate(guestSpot.end_date)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm text-text-sub dark:text-gray-400">
                      <Users className="w-4 h-4" />
                      <span>{guestSpot.application_count || 0}</span>
                    </div>
                    <span className="text-xs text-text-sub dark:text-gray-500">applicants</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </Link>
          ))}
          
          {guestSpots.length > 3 && (
            <Link
              href="/dashboard/studio/guest-spots"
              className="block text-center text-sm font-medium text-primary hover:text-primary-dark py-2"
            >
              View all {guestSpots.length} guest spots
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
