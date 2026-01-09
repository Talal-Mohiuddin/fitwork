import React from 'react';
import { Shield } from 'lucide-react';

interface Step {
  id: string;
  label: string;
  icon: string;
}

interface SideNavigationProps {
  sections: Step[];
  activeStep: string;
  onStepChange: (step: string) => void;
  completionPercentage: number;
}

export default function SideNavigation({
  sections,
  activeStep,
  onStepChange,
  completionPercentage,
}: SideNavigationProps) {
  return (
    <aside className="hidden w-72 flex-col overflow-y-auto border-r border-gray-200 dark:border-gray-800 bg-surface-light dark:bg-surface-dark p-6 md:flex shrink-0 z-10">
      <div className="mb-8">
        <h1 className="text-lg font-display font-bold text-text-main dark:text-white">Profile Builder</h1>
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm text-text-secondary">{completionPercentage}% Complete</p>
          <span className="text-xs font-bold text-primary-dark dark:text-primary">Draft</span>
        </div>
        <div className="mt-3 h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
          <div 
            className="h-full rounded-full bg-primary transition-all duration-500 shadow-[0_0_10px_rgba(19,236,91,0.5)]"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      <nav className="flex flex-col gap-2">
        {sections.map((section, index) => (
          <button
            key={section.id}
            onClick={() => onStepChange(section.id)}
            className={`group flex items-center gap-3 rounded-lg px-4 py-3 border-l-4 transition-all ${
              activeStep === section.id
                ? 'step-active bg-primary/10 border-l-primary'
                : 'step-inactive border-l-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
              activeStep === section.id
                ? 'bg-primary text-black shadow-sm'
                : 'border border-gray-300 dark:border-gray-600 bg-transparent'
            }`}>
              {index + 1}
            </div>
            <span className={`font-${activeStep === section.id ? 'semibold' : 'medium'} text-sm`}>
              {section.label}
            </span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-6">
        <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-start gap-3">
            <Shield size={20} className="text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-text-main dark:text-white">Get Verified</p>
              <p className="text-xs text-text-secondary mt-1">Upload your certs to get the verified badge and boost visibility.</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
