'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, Users, Dumbbell, Loader2, Plane } from 'lucide-react';
import { getStudioDashboardStats } from '@/services/studioService';
import { getGuestSpotStats } from '@/services/guestSpotService';

interface StatCard {
  title: string;
  value: number | string;
  change?: string;
  icon: React.ReactNode;
  iconBg: string;
}

interface StatsCardsProps {
  studioId?: string;
}

export default function StatsCards({ studioId }: StatsCardsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<StatCard[]>([
    {
      title: 'Open Gigs',
      value: 0,
      icon: <AlertCircle size={20} />,
      iconBg: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    },
    {
      title: 'Guest Spots',
      value: 0,
      icon: <Plane size={20} />,
      iconBg: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    },
    {
      title: 'New Applicants',
      value: 0,
      icon: <Users size={20} />,
      iconBg: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Your Bench',
      value: 0,
      icon: <Dumbbell size={20} />,
      iconBg: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    },
  ]);

  useEffect(() => {
    if (studioId) {
      loadStats();
    }
  }, [studioId]);

  const loadStats = async () => {
    if (!studioId) return;
    
    try {
      setIsLoading(true);
      const [dashboardData, guestSpotData] = await Promise.all([
        getStudioDashboardStats(studioId),
        getGuestSpotStats(studioId),
      ]);
      
      const totalPendingApps = dashboardData.pendingApplications + guestSpotData.pendingApplications;
      
      setStats([
        {
          title: 'Open Gigs',
          value: dashboardData.openJobs,
          change: dashboardData.newJobsToday > 0 ? `+${dashboardData.newJobsToday} today` : undefined,
          icon: <AlertCircle size={20} />,
          iconBg: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
        },
        {
          title: 'Guest Spots',
          value: guestSpotData.openGuestSpots,
          icon: <Plane size={20} />,
          iconBg: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
        },
        {
          title: 'New Applicants',
          value: totalPendingApps,
          icon: <Users size={20} />,
          iconBg: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
        },
        {
          title: 'Your Bench',
          value: dashboardData.benchSize,
          icon: <Dumbbell size={20} />,
          iconBg: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
        },
      ]);
    } catch (error) {
      console.error('Error loading studio stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-border-light dark:border-border-dark shadow-sm flex items-center justify-center h-32"
          >
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-border-light dark:border-border-dark shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start mb-4">
            <div className={`p-2 rounded-lg ${stat.iconBg}`}>
              {stat.icon}
            </div>
            {stat.change && (
              <span className="text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded-full">
                {stat.change}
              </span>
            )}
          </div>
          <p className="text-text-sub dark:text-gray-400 text-sm font-medium uppercase tracking-wider">
            {stat.title}
          </p>
          <p className="text-3xl font-bold text-text-main dark:text-white mt-1">
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
