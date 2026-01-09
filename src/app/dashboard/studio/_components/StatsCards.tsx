import React from 'react';
import { AlertCircle, Users, Dumbbell } from 'lucide-react';

interface StatCard {
  title: string;
  value: number | string;
  change?: string;
  icon: React.ReactNode;
  iconBg: string;
}

export default function StatsCards() {
  const stats: StatCard[] = [
    {
      title: 'Open Gigs',
      value: 2,
      change: '+2 today',
      icon: <AlertCircle size={20} />,
      iconBg: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    },
    {
      title: 'New Applicants',
      value: 5,
      icon: <Users size={20} />,
      iconBg: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Active Classes',
      value: 12,
      icon: <Dumbbell size={20} />,
      iconBg: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
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
