import React, { useState } from 'react';
import { Check, Sun, Sunset, Moon, Calendar } from 'lucide-react';
import { Profile } from '@/types';

interface AvailabilitySectionProps {
  profile: Partial<Profile>;
  onChange: (updates: Partial<Profile>) => void;
}

const timeSlots = [
  { id: 'Morning', label: 'Morning', time: '6am - 12pm', icon: Sun },
  { id: 'Afternoon', label: 'Afternoon', time: '12pm - 5pm', icon: Sunset },
  { id: 'Evening', label: 'Evening', time: '5pm - 9pm', icon: Moon },
];

const days = [
  { short: 'M', full: 'Mon' },
  { short: 'T', full: 'Tue' },
  { short: 'W', full: 'Wed' },
  { short: 'T', full: 'Thu' },
  { short: 'F', full: 'Fri' },
  { short: 'S', full: 'Sat' },
  { short: 'S', full: 'Sun' },
];

export default function AvailabilitySection({ profile, onChange }: AvailabilitySectionProps) {
  const [availability, setAvailability] = useState<Record<string, boolean[]>>({
    Morning: [true, true, true, false, true, false, false],
    Afternoon: [false, true, false, true, true, true, false],
    Evening: [true, true, true, true, false, false, false],
  });

  const handleToggle = (slot: string, dayIndex: number) => {
    const updated = { ...availability };
    updated[slot][dayIndex] = !updated[slot][dayIndex];
    setAvailability(updated);

    const slots: string[] = [];
    Object.entries(updated).forEach(([slotName, daySlots]) => {
      daySlots.forEach((isAvailable, idx) => {
        if (isAvailable) {
          const dayName = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][idx];
          const timeRange = slotName === 'Morning' ? '6am-12pm' : slotName === 'Afternoon' ? '12pm-5pm' : '5pm-9pm';
          slots.push(`${dayName} ${timeRange}`);
        }
      });
    });

    onChange({ availability_slots: slots });
  };

  const getAvailabilityCount = () => {
    let count = 0;
    Object.values(availability).forEach(days => {
      count += days.filter(Boolean).length;
    });
    return count;
  };

  return (
    <section className="scroll-mt-24" id="availability">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
        <span className="flex items-center justify-center h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-sm font-bold">4</span>
        Weekly Availability
      </h2>

      <div className="rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-slate-500">Select the general time blocks you're available to teach.</p>
          <div className="flex items-center gap-2 text-sm">
            <Calendar size={16} className="text-emerald-500" />
            <span className="font-semibold text-slate-900 dark:text-white">{getAvailabilityCount()}</span>
            <span className="text-slate-500">slots selected</span>
          </div>
        </div>

        <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
          <div className="min-w-[600px]">
            {/* Header - Days */}
            <div className="grid grid-cols-8 gap-2 mb-4">
              <div></div>
              {days.map((day, idx) => (
                <div key={idx} className="text-center">
                  <span className="hidden sm:block text-xs font-bold text-slate-500 uppercase tracking-wider">{day.full}</span>
                  <span className="sm:hidden text-xs font-bold text-slate-500">{day.short}</span>
                </div>
              ))}
            </div>

            {/* Time Slots */}
            {timeSlots.map((slot) => {
              const Icon = slot.icon;
              const selectedCount = availability[slot.id]?.filter(Boolean).length || 0;
              
              return (
                <div key={slot.id} className="grid grid-cols-8 gap-2 mb-3">
                  {/* Slot Label */}
                  <div className="flex items-center gap-2 pr-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      selectedCount > 0 
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}>
                      <Icon size={16} />
                    </div>
                    <div className="hidden sm:block">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white block leading-tight">{slot.label}</span>
                      <span className="text-[10px] text-slate-400">{slot.time}</span>
                    </div>
                  </div>
                  
                  {/* Day Buttons */}
                  {days.map((_, dayIndex) => {
                    const isSelected = availability[slot.id]?.[dayIndex];
                    const isWeekend = dayIndex >= 5;
                    
                    return (
                      <button
                        key={`${slot.id}-${dayIndex}`}
                        onClick={() => handleToggle(slot.id, dayIndex)}
                        type="button"
                        className={`aspect-square rounded-xl transition-all duration-200 flex items-center justify-center ${
                          isSelected
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600'
                            : isWeekend
                            ? 'bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600 hover:border-emerald-300 hover:text-emerald-400'
                            : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                        }`}
                      >
                        {isSelected && <Check size={18} strokeWidth={3} />}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              const allSelected = { Morning: Array(7).fill(true), Afternoon: Array(7).fill(true), Evening: Array(7).fill(true) };
              setAvailability(allSelected);
            }}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={() => {
              const weekdaysOnly = { 
                Morning: [true, true, true, true, true, false, false], 
                Afternoon: [true, true, true, true, true, false, false], 
                Evening: [true, true, true, true, true, false, false] 
              };
              setAvailability(weekdaysOnly);
            }}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Weekdays Only
          </button>
          <button
            type="button"
            onClick={() => {
              const clearAll = { Morning: Array(7).fill(false), Afternoon: Array(7).fill(false), Evening: Array(7).fill(false) };
              setAvailability(clearAll);
            }}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>
    </section>
  );
}
