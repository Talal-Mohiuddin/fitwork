import React from 'react';
import { AlertCircle } from 'lucide-react';

interface Shift {
  id: string;
  date: string;
  time: string;
  classType: string;
  status: 'urgent' | 'open';
  color: string;
}

export default function OpenShiftsSection() {
  const shifts: Shift[] = [
    {
      id: '1',
      date: 'Tomorrow',
      time: '7:00 AM - 8:00 AM',
      classType: 'HIIT Flow',
      status: 'urgent',
      color: 'bg-orange-500',
    },
    {
      id: '2',
      date: 'Friday',
      time: '6:00 PM - 7:00 PM',
      classType: 'Vinyasa Yoga',
      status: 'open',
      color: 'bg-blue-500',
    },
  ];

  return (
    <section className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-border-light dark:border-border-dark flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/20">
        <div className="flex items-center gap-2">
          <AlertCircle size={20} className="text-orange-500" />
          <div>
            <h2 className="text-lg font-bold text-text-main dark:text-white">
              Open Shifts
            </h2>
            <span className="text-text-sub font-normal text-sm">
              (Next 48 Hours)
            </span>
          </div>
        </div>
        <button className="text-primary text-sm font-semibold hover:underline transition-colors">
          View All
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-light dark:border-border-dark text-text-sub dark:text-gray-400 text-sm">
              <th className="px-6 py-4 font-medium w-1/4">Time</th>
              <th className="px-6 py-4 font-medium w-1/4">Class Type</th>
              <th className="px-6 py-4 font-medium w-1/6">Status</th>
              <th className="px-6 py-4 font-medium w-1/4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light dark:divide-gray-800">
            {shifts.map((shift) => (
              <tr
                key={shift.id}
                className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <p className="text-text-main dark:text-white font-medium text-sm">
                    {shift.date}
                  </p>
                  <p className="text-text-sub text-xs">{shift.time}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`size-2 rounded-full ${shift.color}`} />
                    <span className="text-text-main dark:text-white text-sm">
                      {shift.classType}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      shift.status === 'urgent'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                    }`}
                  >
                    {shift.status === 'urgent' ? 'Urgent' : 'Open'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="inline-flex items-center justify-center px-4 py-2 bg-surface-light border border-border-light rounded-lg text-sm font-medium text-text-main hover:bg-gray-50 dark:bg-transparent dark:border-gray-600 dark:text-white dark:hover:bg-gray-800 transition-colors">
                    Find Sub
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
