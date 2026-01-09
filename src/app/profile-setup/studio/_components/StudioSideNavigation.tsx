import React from 'react';

interface StudioStep {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface StudioSideNavigationProps {
  sections: StudioStep[];
  activeStep: string;
  onStepChange: (step: string) => void;
  completionPercentage: number;
}

export default function StudioSideNavigation({
  sections,
  activeStep,
  onStepChange,
  completionPercentage,
}: StudioSideNavigationProps) {
  return (
    <aside className="w-full lg:w-64 flex-shrink-0 lg:sticky lg:top-24">
      <div className="bg-white dark:bg-[#1a2c20] rounded-xl p-6 shadow-sm border border-[#f0f4f2] dark:border-[#2a4030]">
        <div className="mb-6">
          <h1 className="text-lg font-bold text-text-main dark:text-white mb-1">Profile Steps</h1>
          <p className="text-text-secondary text-xs">Complete all sections to publish</p>
        </div>

        <nav className="flex flex-col gap-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => onStepChange(section.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border-l-4 transition-all text-left w-full ${
                activeStep === section.id
                  ? 'bg-primary/10 border-l-primary text-primary dark:text-white'
                  : 'hover:bg-gray-50 dark:hover:bg-[#233529] text-gray-600 dark:text-gray-300 border-l-transparent'
              }`}
            >
              <span className="text-primary">{section.icon}</span>
              <span className="text-sm font-medium">{section.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Completion</span>
            <span className="text-xs font-bold text-primary">{completionPercentage}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
