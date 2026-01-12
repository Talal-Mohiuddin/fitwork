"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/firebase-auth-provider";
import { createEnhancedJob } from "@/services/jobService";
import { JobPostingData } from "@/types";

// Step Components
import StepClassType from "./_components/StepClassType";
import StepScheduleLocation from "./_components/StepScheduleLocation";
import StepPayContract from "./_components/StepPayContract";
import StepRequirements from "./_components/StepRequirements";
import StepReview from "./_components/StepReview";
import { Loader2 } from "lucide-react";

const TOTAL_STEPS = 5;

const initialFormData: JobPostingData = {
  classType: "Yoga",
  date: "",
  startTime: "07:00",
  endTime: "08:00",
  isRecurring: false,
  location: "",
  payType: "flat_fee",
  payAmount: 0,
  currency: "USD",
  employmentStatus: "contractor",
  cancellationPolicy: "standard",
  certificationsRequired: [],
  experienceLevel: "established",
  notes: "",
  visibility: "public",
};

export default function PostJobWizardPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<JobPostingData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateFormData = (updates: Partial<JobPostingData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      setError("Please sign in to post a job");
      return;
    }

    if (profile?.user_type !== "studio") {
      setError("Only studios can post jobs");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await createEnhancedJob(user.uid, formData);

      // Redirect to dashboard after success
      router.push("/dashboard/studio?jobPosted=true");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to post job";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    // Save to localStorage
    localStorage.setItem("jobDraft", JSON.stringify({
      ...formData,
      savedAt: new Date().toISOString(),
      userId: user?.uid,
    }));
    router.push("/dashboard/studio?draftSaved=true");
  };

  const progressPercentage = (currentStep / TOTAL_STEPS) * 100;

  // Redirect if not a studio
  if (profile && profile.user_type !== "studio") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <h2 className="text-xl font-bold text-text-main dark:text-white mb-2">
            Studios Only
          </h2>
          <p className="text-text-sub dark:text-gray-400">
            Only studio accounts can post jobs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFC] dark:bg-background-dark">
      {/* Header */}
      <header className="bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-primary text-2xl">⚡</span>
            <span className="font-bold text-xl text-text-main dark:text-white">Fitgig</span>
          </div>
          
          <button 
            onClick={handleSaveDraft}
            className="text-text-sub hover:text-text-main dark:hover:text-white text-sm font-medium"
          >
            Save Draft
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-primary">
              Step {currentStep} of {TOTAL_STEPS}
            </span>
            <span className="text-sm text-text-sub">
              {Math.round(progressPercentage)}% completed
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8">
          {currentStep === 1 && (
            <StepClassType 
              formData={formData} 
              updateFormData={updateFormData}
            />
          )}
          {currentStep === 2 && (
            <StepScheduleLocation 
              formData={formData} 
              updateFormData={updateFormData}
            />
          )}
          {currentStep === 3 && (
            <StepPayContract 
              formData={formData} 
              updateFormData={updateFormData}
            />
          )}
          {currentStep === 4 && (
            <StepRequirements 
              formData={formData} 
              updateFormData={updateFormData}
            />
          )}
          {currentStep === 5 && (
            <StepReview 
              formData={formData} 
              updateFormData={updateFormData}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-6 py-3 text-text-main dark:text-white font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Back
          </button>

          {currentStep < TOTAL_STEPS ? (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-3 rounded-lg transition-colors shadow-md"
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-semibold px-8 py-3 rounded-lg transition-colors shadow-md"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Posting...
                </>
              ) : (
                <>Confirm & Post Gig →</>
              )}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
