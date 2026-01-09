import React from 'react';
import { DollarSign, Dumbbell, Eye } from 'lucide-react';

interface StatCard {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
}

export default function StatsSection() {
  const stats: StatCard[] = [
    {
      title: 'Total Earnings',
      value: '$850',
      change: 12,
      icon: <DollarSign size={20} />,
    },
    {
      title: 'Classes Taught',
      value: '12',
      change: 2,
      icon: <Dumbbell size={20} />,
    },
    {
      title: 'Profile Views',
      value: '45',
      change: 5,
      icon: <Eye size={20} />,
    },
  ];

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
