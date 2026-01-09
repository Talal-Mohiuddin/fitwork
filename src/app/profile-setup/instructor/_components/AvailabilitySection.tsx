import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { Profile } from '@/types';

interface AvailabilitySectionProps {
  profile: Partial<Profile>;
  onChange: (updates: Partial<Profile>) => void;
}

const timeSlots = ['Morning (6am-12pm)', 'Afternoon (12pm-5pm)', 'Evening (5pm-9pm)'];
const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export default function AvailabilitySection({ profile, onChange }: AvailabilitySectionProps) {
  const [availability, setAvailability] = useState<Record<string, boolean[]>>({
    Morning: [true, true, true, false, true, false, false],
    Afternoon: [false, false, false, false, true, true, true],
    Evening: [true, true, true, true, false, false, false],
  });

  const handleToggle = (slot: string, dayIndex: number) => {
    const updated = { ...availability };
    updated[slot][dayIndex] = !updated[slot][dayIndex];
    setAvailability(updated);

    const slots: string[] = [];
    Object.entries(updated).forEach(([slot, days]) => {
      days.forEach((isAvailable, dayIdx) => {
        if (isAvailable) {
          const dayName = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][dayIdx];
          const timeRange = slot === 'Morning' ? '9am-12pm' : slot === 'Afternoon' ? '12pm-5pm' : '5pm-9pm';
          slots.push(`${dayName} ${timeRange}`);
        }
      });
    });

    onChange({ availability_slots: slots });
  };

  return (
    <section className="scroll-mt-24" id="availability">
      <h2 className="text-2xl font-display font-bold text-text-main dark:text-white mb-6 flex items-center gap-3">
        <span className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm">4</span>
        Weekly Availability
      </h2>

      <div className="rounded-2xl border border-gray-200 bg-surface-light dark:bg-surface-dark dark:border-gray-800 p-8 shadow-sm">
        <p className="text-sm text-text-secondary mb-6">Select the general time blocks you are available to teach. You can adjust specific hours later.</p>

        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Header */}
            <div className="grid grid-cols-8 gap-3 text-center mb-2">
              <div className="text-left text-xs font-bold text-text-secondary uppercase tracking-wider self-end pb-2">Time</div>
              {days.map((day) => (
                <div key={day} className="text-xs font-bold text-text-main dark:text-white pb-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Time Slots */}
            {timeSlots.map((slot) => (
              <div key={slot} className="grid grid-cols-8 gap-3 mb-3">
                <div className="flex flex-col justify-center text-left">
                  <span className="text-sm font-bold text-text-main dark:text-white">{slot.split(' ')[0]}</span>
                  <span className="text-[10px] text-text-secondary">{slot.split(' ')[1]}</span>
                </div>
                {days.map((_, dayIndex) => (
                  <button
                    key={`${slot}-${dayIndex}`}
                    onClick={() => handleToggle(slot, dayIndex)}
                    type="button"
                    className={`aspect-[4/3] rounded-lg transition-all flex items-center justify-center ${
                      availability[slot]?.[dayIndex]
                        ? 'bg-primary hover:bg-primary-dark text-black shadow-sm shadow-primary/20'
                        : dayIndex > 4
                        ? 'bg-gray-50 dark:bg-gray-800 opacity-50 cursor-not-allowed'
                        : 'border border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary/5'
                    }`}
                    disabled={dayIndex > 4}
                  >
                    {availability[slot]?.[dayIndex] && (
                      <Check size={20} />
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
