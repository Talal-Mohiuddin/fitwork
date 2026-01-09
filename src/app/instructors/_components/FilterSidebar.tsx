'use client';

import { useState } from 'react';
import { Search, MapPin, Check } from 'lucide-react';

interface FilterSidebarProps {
  onFilterChange: (filters: any) => void;
}

export default function FilterSidebar({ onFilterChange }: FilterSidebarProps) {
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>(['Yoga']);
  const [radius, setRadius] = useState(5);
  const [selectedExperience, setSelectedExperience] = useState<string>('Mid-Level (3-5 years)');
  const [weekendAvailable, setWeekendAvailable] = useState(false);

  const disciplines = ['Yoga', 'Pilates', 'HIIT', 'Barre', 'Spin', 'CrossFit', 'Boxing', 'Breathwork'];
  const experienceLevels = ['Junior (0-2 years)', 'Mid-Level (3-5 years)', 'Senior (5+ years)'];

  const handleDisciplineClick = (discipline: string) => {
    setSelectedDisciplines((prev) =>
      prev.includes(discipline)
        ? prev.filter((d) => d !== discipline)
        : [...prev, discipline]
    );
  };

  const handleExperienceChange = (level: string) => {
    setSelectedExperience(level);
  };

  const clearDisciplines = () => {
    setSelectedDisciplines([]);
  };

  return (
    <div className="w-80 shrink-0 hidden lg:flex flex-col border-r border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark overflow-y-auto ">
      <style jsx>{`
        input[type='range'] {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 8px;
          background: transparent;
          cursor: pointer;
        }

        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: 3px solid #13ec5b;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        input[type='range']::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: 3px solid #13ec5b;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        input[type='range']::-moz-range-track {
          background: transparent;
          border: none;
        }

        input[type='range']::-webkit-slider-runnable-track {
          background: transparent;
        }
      `}</style>
      <div className="p-6 flex flex-col gap-8">
        {/* Search */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold uppercase tracking-wider text-text-muted">
            Search
          </label>
          <div className="flex w-full items-center rounded-lg bg-background-light dark:bg-background-dark border border-transparent focus-within:border-primary transition-colors h-10 px-3">
            <Search size={20} className="text-text-muted shrink-0" />
            <input
              className="w-full bg-transparent border-none t"
              placeholder="Name or keyword..."
            />
          </div>
        </div>

        {/* Discipline Filter */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-bold uppercase tracking-wider text-text-muted">
              Discipline
            </label>
            {selectedDisciplines.length > 0 && (
              <button
                onClick={clearDisciplines}
                className="text-xs text-primary font-medium hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {disciplines.map((discipline) => (
              <button
                key={discipline}
                onClick={() => handleDisciplineClick(discipline)}
                className={`flex h-8 items-center justify-center gap-x-2 rounded-lg px-3 transition-colors ${
                  selectedDisciplines.includes(discipline)
                    ? 'bg-primary text-[#111813]'
                    : 'bg-background-light dark:bg-background-dark hover:bg-gray-200 dark:hover:bg-gray-800 border border-border-light dark:border-border-dark'
                }`}
              >
                <span className="text-xs font-bold">{discipline}</span>
                {selectedDisciplines.includes(discipline) && (
                  <span className="text-[14px]">×</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Location Radius */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-end">
            <label className="text-sm font-bold uppercase tracking-wider text-text-muted">
              Radius
            </label>
            <span className="text-sm font-medium text-text-main dark:text-white">
              {radius} miles
            </span>
          </div>
          <div className="relative w-full">
            <div className="absolute top-1/2 -translate-y-1/2 w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full pointer-events-none">
              <div
                className="absolute h-full bg-primary rounded-full"
                style={{ width: `${(radius / 50) * 100}%` }}
              ></div>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value))}
              className="relative w-full h-2"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <MapPin size={16} className="shrink-0" />
            <span>Current Studio: Downtown</span>
          </div>
        </div>

        {/* Experience Level */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-bold uppercase tracking-wider text-text-muted">
            Experience
          </label>
          <div className="flex flex-col gap-2">
            {experienceLevels.map((level) => (
              <button
                key={level}
                onClick={() => handleExperienceChange(level)}
                className="flex items-center gap-3 cursor-pointer group text-left"
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
                    selectedExperience === level
                      ? 'border-primary bg-primary'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-transparent group-hover:border-primary'
                  }`}
                >
                  {selectedExperience === level && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                <span
                  className={`text-sm ${
                    selectedExperience === level
                      ? 'font-medium text-text-main dark:text-white'
                      : 'text-text-main dark:text-gray-300'
                  }`}
                >
                  {level}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-bold uppercase tracking-wider text-text-muted">
            Availability
          </label>
          <div className="p-3 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-text-main dark:text-white">Tomorrow</span>
              <span className="text-xs text-text-muted">Oct 24</span>
            </div>
            <div className="flex gap-1">
              <div className="h-1.5 flex-1 rounded-full bg-primary"></div>
              <div className="h-1.5 flex-1 rounded-full bg-primary/30"></div>
              <div className="h-1.5 flex-1 rounded-full bg-primary"></div>
            </div>
            <p className="text-[10px] text-text-muted mt-2">
              High availability in morning slots.
            </p>
          </div>
          <label className="flex items-center gap-2 mt-1 cursor-pointer">
            <div
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                weekendAvailable
                  ? 'bg-primary'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  weekendAvailable ? 'translate-x-5' : 'translate-x-1'
                }`}
              ></span>
            </div>
            <span className="text-sm text-text-main dark:text-gray-300">
              Available this weekend
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
