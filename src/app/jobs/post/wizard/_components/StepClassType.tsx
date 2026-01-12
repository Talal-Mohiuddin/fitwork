"use client";

import { ClassType, JobPostingData } from "@/types";
import { 
  Bike, 
  Dumbbell, 
  Heart, 
  Flame,
  Waves,
  Swords,
  Zap,
  MoreHorizontal
} from "lucide-react";

interface StepClassTypeProps {
  formData: JobPostingData;
  updateFormData: (updates: Partial<JobPostingData>) => void;
}

const classTypes: { type: ClassType; label: string; icon: React.ReactNode }[] = [
  { type: "Spin", label: "Spin", icon: <Bike className="w-6 h-6" /> },
  { type: "HIIT", label: "HIIT", icon: <Flame className="w-6 h-6" /> },
  { type: "Yoga", label: "Yoga", icon: <Heart className="w-6 h-6" /> },
  { type: "Pilates", label: "Pilates", icon: <Waves className="w-6 h-6" /> },
  { type: "Barre", label: "Barre", icon: <Dumbbell className="w-6 h-6" /> },
  { type: "Boxing", label: "Boxing", icon: <Swords className="w-6 h-6" /> },
  { type: "Strength", label: "Strength", icon: <Zap className="w-6 h-6" /> },
  { type: "Other", label: "Other", icon: <MoreHorizontal className="w-6 h-6" /> },
];

export default function StepClassType({ formData, updateFormData }: StepClassTypeProps) {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <h2 className="text-2xl md:text-3xl font-bold text-text-main dark:text-white mb-3">
        What type of class needs coverage?
      </h2>
      <p className="text-text-sub dark:text-gray-400 mb-8">
        Select the category that best fits. This helps match you with the right talent instantly.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {classTypes.map(({ type, label, icon }) => (
          <button
            key={type}
            onClick={() => updateFormData({ classType: type })}
            className={`relative flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 transition-all ${
              formData.classType === type
                ? "border-primary bg-primary/5 shadow-md"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            {formData.classType === type && (
              <div className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            <div className={`${formData.classType === type ? "text-primary" : "text-text-sub"}`}>
              {icon}
            </div>
            <span className={`font-medium ${
              formData.classType === type 
                ? "text-text-main dark:text-white" 
                : "text-text-sub dark:text-gray-400"
            }`}>
              {label}
            </span>
          </button>
        ))}
      </div>

      {formData.classType === "Other" && (
        <div className="mt-6">
          <input
            type="text"
            placeholder="Enter class type..."
            value={formData.customClassType || ""}
            onChange={(e) => updateFormData({ customClassType: e.target.value })}
            className="w-full max-w-md mx-auto px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-surface-dark text-text-main dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      )}
    </div>
  );
}
