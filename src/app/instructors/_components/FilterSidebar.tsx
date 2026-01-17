'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, X } from 'lucide-react';
import { InstructorFilters } from '@/services/talentService';

interface FilterSidebarProps {
  onFilterChange: (filters: Partial<InstructorFilters>) => void;
}

export default function FilterSidebar({ onFilterChange }: FilterSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<number | null>(null);
  const [openToWork, setOpenToWork] = useState(false);

  const disciplines = ['Yoga', 'Pilates', 'HIIT', 'Barre', 'Spin', 'CrossFit', 'Boxing', 'Breathwork', 'Strength Training', 'Dance Fitness'];
  const experienceLevels = [
    { label: 'Junior (0-2 years)', value: 0 },
    { label: 'Mid-Level (3-5 years)', value: 3 },
    { label: 'Senior (5+ years)', value: 5 },
  ];

  // Debounced filter update
  const updateFilters = useCallback(() => {
    const filters: Partial<InstructorFilters> = {};
    
    if (selectedStyles.length > 0) {
      filters.styles = selectedStyles;
    }
    
    if (selectedExperience !== null) {
      filters.minExperience = selectedExperience;
    }
    
    if (openToWork) {
      filters.openToWork = true;
    }
    
    onFilterChange(filters);
  }, [selectedStyles, selectedExperience, openToWork, onFilterChange]);

  // Update filters when selections change
  useEffect(() => {
    updateFilters();
  }, [updateFilters]);

  const handleStyleClick = (style: string) => {
    setSelectedStyles((prev) =>
      prev.includes(style)
        ? prev.filter((s) => s !== style)
        : [...prev, style]
    );
  };

  const handleExperienceChange = (value: number | null) => {
    setSelectedExperience(prev => prev === value ? null : value);
  };

  const clearStyles = () => {
    setSelectedStyles([]);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedStyles([]);
    setSelectedExperience(null);
    setOpenToWork(false);
  };

  const hasActiveFilters = selectedStyles.length > 0 || selectedExperience !== null || openToWork;

  return (
    <div className="w-80 shrink-0 hidden lg:flex flex-col border-r border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark overflow-y-auto">
      <div className="p-6 flex flex-col gap-8">
        {/* Header with Clear All */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-text-main dark:text-white">Filters</h3>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
            >
              <X size={14} />
              Clear all
            </button>
          )}
        </div>

        {/* Search */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold uppercase tracking-wider text-text-muted">
            Search
          </label>
          <div className="flex w-full items-center rounded-lg bg-background-light dark:bg-background-dark border border-transparent focus-within:border-primary transition-colors h-10 px-3">
            <Search size={20} className="text-text-muted shrink-0" />
            <input
              className="w-full bg-transparent border-none outline-none text-sm"
              placeholder="Name or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Discipline/Style Filter */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-bold uppercase tracking-wider text-text-muted">
              Discipline
            </label>
            {selectedStyles.length > 0 && (
              <button
                onClick={clearStyles}
                className="text-xs text-primary font-medium hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {disciplines.map((style) => (
              <button
                key={style}
                onClick={() => handleStyleClick(style)}
                className={`flex h-8 items-center justify-center gap-x-2 rounded-lg px-3 transition-colors ${
                  selectedStyles.includes(style)
                    ? 'bg-primary text-[#111813]'
                    : 'bg-background-light dark:bg-background-dark hover:bg-gray-200 dark:hover:bg-gray-800 border border-border-light dark:border-border-dark'
                }`}
              >
                <span className="text-xs font-bold">{style}</span>
                {selectedStyles.includes(style) && (
                  <span className="text-[14px]">×</span>
                )}
              </button>
            ))}
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
                key={level.label}
                onClick={() => handleExperienceChange(level.value)}
                className="flex items-center gap-3 cursor-pointer group text-left"
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
                    selectedExperience === level.value
                      ? 'border-primary bg-primary'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-transparent group-hover:border-primary'
                  }`}
                >
                  {selectedExperience === level.value && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                <span
                  className={`text-sm ${
                    selectedExperience === level.value
                      ? 'font-medium text-text-main dark:text-white'
                      : 'text-text-main dark:text-gray-300'
                  }`}
                >
                  {level.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Open to Work Toggle */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-bold uppercase tracking-wider text-text-muted">
            Availability
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setOpenToWork(!openToWork)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                openToWork
                  ? 'bg-primary'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  openToWork ? 'translate-x-6' : 'translate-x-1'
                }`}
              ></span>
            </div>
            <span className="text-sm text-text-main dark:text-gray-300">
              Open to work only
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
