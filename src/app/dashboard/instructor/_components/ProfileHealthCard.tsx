import React from 'react';
import { Video } from 'lucide-react';

export default function ProfileHealthCard() {
  const healthPercentage = 85;

  return (
    <div className="bg-white dark:bg-[#1e293b] p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex gap-6 justify-between mb-3">
        <p className="text-slate-900 dark:text-white text-base font-bold leading-normal">
          Profile Health
        </p>
        <p className="text-primary text-sm font-bold leading-normal">{healthPercentage}%</p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 mb-4">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-500"
          style={{ width: `${healthPercentage}%` }}
        />
      </div>

      {/* Suggestion */}
      <div className="flex gap-3 items-start p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
        <Video size={20} className="text-primary mt-0.5 flex-shrink-0" />
        <div className="flex flex-col">
          <p className="text-slate-900 dark:text-white text-sm font-medium">
            Add a video reel
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-xs">
            Boost your visibility by 2x.
          </p>
        </div>
      </div>
    </div>
  );
}
