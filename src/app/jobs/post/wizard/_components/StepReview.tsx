"use client";

import { JobPostingData } from "@/types";
import { MapPin, Calendar, DollarSign, FileText, Globe, Users, Edit2, Lightbulb } from "lucide-react";

interface StepReviewProps {
  formData: JobPostingData;
  updateFormData: (updates: Partial<JobPostingData>) => void;
}

export default function StepReview({ formData, updateFormData }: StepReviewProps) {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Not set";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (time: string) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getPayString = () => {
    if (formData.payType === "range") {
      return `$${formData.payMin} - $${formData.payMax}`;
    } else if (formData.payType === "hourly") {
      return `$${formData.payAmount}/hr`;
    }
    return `$${formData.payAmount}`;
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-2">
        <span className="text-xs font-medium text-text-sub">Step 5 of 5</span>
      </div>
      <h2 className="text-2xl md:text-3xl font-bold text-text-main dark:text-white mb-3">
        Review & Launch
      </h2>
      <p className="text-text-sub dark:text-gray-400 mb-8">
        Double-check the details. You&apos;re ready to fill this spot.
      </p>

      {/* Gig Summary Card */}
      <div className="bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-medium text-text-sub uppercase tracking-wide">
              Gig Summary
            </h3>
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium">
              Draft
            </span>
          </div>

          {/* Class Details */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🏃</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-sub">Class</span>
                <button className="text-text-sub hover:text-primary">
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
              <h4 className="font-bold text-xl text-text-main dark:text-white">
                {formData.customClassType || formData.classType} Class
              </h4>
              <p className="text-text-sub text-sm">
                {formatDate(formData.date)} • {formatTime(formData.startTime)} - {formatTime(formData.endTime)}
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-text-sub" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-sub">Location</span>
                <button className="text-text-sub hover:text-primary">
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
              <h4 className="font-semibold text-text-main dark:text-white">
                {formData.location || "Location not set"}
              </h4>
              <p className="text-text-sub text-sm">
                {formData.studioAddress || "Studio address"}
              </p>
            </div>
            {/* Map placeholder */}
            <div className="w-24 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0 hidden md:block" />
          </div>

          {/* Rate & Requirements */}
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5 text-text-sub" />
              </div>
              <div>
                <span className="text-xs text-text-sub">Rate</span>
                <h4 className="font-bold text-lg text-text-main dark:text-white">
                  {getPayString()}
                </h4>
                <p className="text-text-sub text-xs">
                  {formData.payType === "flat_fee" ? "/ class" : ""}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-text-sub" />
              </div>
              <div>
                <span className="text-xs text-text-sub">Requirements</span>
                <ul className="text-sm text-text-main dark:text-white mt-1">
                  {formData.certificationsRequired.length > 0 ? (
                    formData.certificationsRequired.slice(0, 2).map(cert => (
                      <li key={cert}>• {cert}</li>
                    ))
                  ) : (
                    <li className="text-text-sub">No specific requirements</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Visibility Selection */}
        <div className="p-6">
          <h3 className="font-semibold text-text-main dark:text-white mb-4">
            Who should see this gig?
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => updateFormData({ visibility: "public" })}
              className={`relative p-5 rounded-xl border-2 text-left transition-all ${
                formData.visibility === "public"
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              {formData.visibility === "public" && (
                <div className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              <Globe className={`w-6 h-6 mb-3 ${formData.visibility === "public" ? "text-primary" : "text-text-sub"}`} />
              <h4 className="font-semibold text-text-main dark:text-white mb-1">
                Post Publicly
              </h4>
              <p className="text-sm text-text-sub">
                Broadcast to the entire Fitgig network. Best for finding new talent quickly.
              </p>
            </button>

            <button
              onClick={() => updateFormData({ visibility: "bench_only" })}
              className={`relative p-5 rounded-xl border-2 text-left transition-all ${
                formData.visibility === "bench_only"
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              {formData.visibility === "bench_only" && (
                <div className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              <Users className={`w-6 h-6 mb-3 ${formData.visibility === "bench_only" ? "text-primary" : "text-text-sub"}`} />
              <h4 className="font-semibold text-text-main dark:text-white mb-1">
                Invite My Bench
              </h4>
              <p className="text-sm text-text-sub">
                Send only to your saved roster of instructors. Best for trusted subs.
              </p>
            </button>
          </div>

          {/* Success Prediction */}
          <div className="mt-6 flex items-center gap-2 text-sm text-text-sub">
            <Lightbulb className="w-4 h-4 text-primary" />
            <span>
              <span className="font-medium">Success Prediction:</span> We found{" "}
              <span className="font-semibold text-text-main dark:text-white">12 instructors</span>{" "}
              matching your criteria.
            </span>
          </div>
        </div>
      </div>

      {/* Terms Notice */}
      <p className="text-center text-xs text-text-sub">
        By posting, you agree to Fitgig&apos;s{" "}
        <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
        {" "}and{" "}
        <a href="/terms" className="text-primary hover:underline">Cancellation Policy</a>.
      </p>
    </div>
  );
}
