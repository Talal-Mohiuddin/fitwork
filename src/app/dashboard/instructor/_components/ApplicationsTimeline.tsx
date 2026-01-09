import React from 'react';

interface Application {
  id: string;
  studio: string;
  status: 'offered' | 'shortlisted' | 'applied';
  statusLabel: string;
  statusColor: string;
  action?: string;
  date: string;
}

export default function ApplicationsTimeline() {
  const applications: Application[] = [
    {
      id: '1',
      studio: 'Equinox',
      status: 'offered',
      statusLabel: 'Offered',
      statusColor: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
      action: 'Review Offer',
      date: 'Yesterday',
    },
    {
      id: '2',
      studio: 'SoulCycle Downtown',
      status: 'shortlisted',
      statusLabel: 'Shortlisted',
      statusColor: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      action: undefined,
      date: '2d ago',
    },
    {
      id: '3',
      studio: 'Barry\'s Bootcamp',
      status: 'applied',
      statusLabel: 'Applied',
      statusColor: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
      action: undefined,
      date: '5d ago',
    },
  ];

  const statusDotColors = {
    offered: 'bg-yellow-400',
    shortlisted: 'bg-primary',
    applied: 'bg-slate-300 dark:bg-slate-600',
  };

  return (
    <div className="bg-white dark:bg-[#1e293b] p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex-1">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-slate-900 dark:text-white text-base font-bold">
          Applications
        </h3>
        <a className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors" href="#">
          View all
        </a>
      </div>

      {/* Timeline */}
      <div className="relative flex flex-col gap-6 pl-2 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-px before:bg-slate-200 dark:before:bg-slate-700">
        {applications.map((app) => (
          <div key={app.id} className="relative pl-8">
            {/* Timeline Dot */}
            <div
              className={`absolute left-[3px] top-1.5 size-2.5 rounded-full ring-4 ring-white dark:ring-[#1e293b] ${
                statusDotColors[app.status]
              }`}
            />

            {/* Content */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-start">
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {app.studio}
                </p>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${app.statusColor}`}>
                  {app.statusLabel}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {app.action ? 'Action Required' : 'Interview pending'} • {app.date}
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
    </div>
  );
}
