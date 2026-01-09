import React from 'react';
import { MapPin, Clock } from 'lucide-react';

interface ScheduleItem {
  id: string;
  time: string;
  period: 'AM' | 'PM';
  title: string;
  duration: string;
  location: string;
  address: string;
  buttonLabel: string;
  buttonVariant: 'primary' | 'secondary';
}

export default function ScheduleSection() {
  const scheduleItems: ScheduleItem[] = [
    {
      id: '1',
      time: '09:00',
      period: 'AM',
      title: 'HIIT Advanced',
      duration: '45 mins',
      location: 'Barry\'s Bootcamp, Downtown',
      address: 'Barry\'s Bootcamp, Downtown',
      buttonLabel: 'Check-in',
      buttonVariant: 'primary',
    },
    {
      id: '2',
      time: '05:30',
      period: 'PM',
      title: 'Vinyasa Flow',
      duration: '60 mins',
      location: 'Equinox, Hudson Yards',
      address: 'Equinox, Hudson Yards',
      buttonLabel: 'Details',
      buttonVariant: 'secondary',
    },
  ];

  return (
    <section>
      <div className="flex justify-between items-end mb-4">
        <h2 className="text-slate-900 dark:text-white text-lg font-bold tracking-tight">
          Today's Schedule
        </h2>
        <a className="text-primary text-sm font-medium hover:text-green-700 transition-colors" href="#">
          View Calendar
        </a>
      </div>

      <div className="flex flex-col gap-3">
        {scheduleItems.map((item) => (
          <div
            key={item.id}
            className="group bg-white dark:bg-[#1e293b] rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:border-primary/50 dark:hover:border-primary/50 transition-colors flex flex-col sm:flex-row items-start sm:items-center gap-4"
          >
            {/* Time Box */}
            <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-lg h-16 w-16 min-w-[64px] border border-slate-100 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-500 uppercase">
                {item.period}
              </span>
              <span className="text-xl font-black text-slate-900 dark:text-white">
                {item.time}
              </span>
            </div>

            {/* Details */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300">
                  {item.duration}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                <MapPin size={16} />
                <span>{item.location}</span>
              </div>
            </div>

            {/* Button */}
            <button
              className={`mt-2 sm:mt-0 w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                item.buttonVariant === 'primary'
                  ? 'bg-primary hover:bg-green-700 text-white shadow-sm shadow-green-900/10'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white'
              }`}
            >
              {item.buttonLabel}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
