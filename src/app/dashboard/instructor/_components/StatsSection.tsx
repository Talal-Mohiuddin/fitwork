import React, { useEffect, useState } from 'react';
import { DollarSign, Dumbbell, Eye, Loader2 } from 'lucide-react';
import { getInstructorStats } from '@/services/talentService';

interface StatCard {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
}

interface StatsSectionProps {
  userId?: string;
}

export default function StatsSection({ userId }: StatsSectionProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<StatCard[]>([
    {
      title: 'Total Earnings',
      value: '$0',
      change: 0,
      icon: <DollarSign size={20} />,
    },
    {
      title: 'Classes Taught',
      value: '0',
      change: 0,
      icon: <Dumbbell size={20} />,
    },
    {
      title: 'Profile Views',
      value: '0',
      change: 0,
      icon: <Eye size={20} />,
    },
  ]);

  useEffect(() => {
    if (userId) {
      loadStats();
    }
  }, [userId]);

  const loadStats = async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      const data = await getInstructorStats(userId);
      
      setStats([
        {
          title: 'Total Earnings',
          value: '$850', // Would come from earnings service
          change: 12,
          icon: <DollarSign size={20} />,
        },
        {
          title: 'Applications',
          value: data.totalApplications.toString(),
          change: data.pendingApplications > 0 ? data.pendingApplications : 0,
          icon: <Dumbbell size={20} />,
        },
        {
          title: 'Profile Views',
          value: data.profileViews.toString(),
          change: 5,
          icon: <Eye size={20} />,
        },
      ]);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#1e293b] p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center h-24"
          >
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ))}
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="bg-white dark:bg-[#1e293b] p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-1"
        >
          <div className="flex justify-between items-start">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              {stat.title}
            </p>
            <span className="text-slate-400">{stat.icon}</span>
          </div>
          <div className="flex items-end gap-2 mt-2">
            <p className="text-slate-900 dark:text-white text-2xl font-bold leading-none tracking-tight">
              {stat.value}
            </p>
            <span className="text-primary dark:text-green-400 text-xs font-medium bg-green-50 dark:bg-green-900/30 px-1.5 py-0.5 rounded">
              +{stat.change}%
            </span>
          </div>
        </div>
      ))}
    </section>
  );
}
