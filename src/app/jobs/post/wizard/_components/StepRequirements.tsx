"use client";

import { JobPostingData, ExperienceLevel } from "@/types";
import { Award, Briefcase, FileText, Lightbulb, X } from "lucide-react";
import { useState } from "react";

interface StepRequirementsProps {
  formData: JobPostingData;
  updateFormData: (updates: Partial<JobPostingData>) => void;
}

const experienceLevels: { level: ExperienceLevel; label: string; years: string }[] = [
  { level: "junior", label: "Junior", years: "< 1 Year" },
  { level: "established", label: "Established", years: "1-3 Years" },
  { level: "expert", label: "Expert", years: "3+ Years" },
];

const commonCertifications = [
  "CPR/AED Certified",
  "Liability Insurance",
  "NASM",
  "ACE",
  "RYT-200",
  "RYT-500",
  "Pilates Mat Certified",
  "Reformer Certified",
  "Spinning Certified",
  "CrossFit L1",
  "CrossFit L2",
  "First Aid",
];

export default function StepRequirements({ formData, updateFormData }: StepRequirementsProps) {
  const [certSearch, setCertSearch] = useState("");

  const addCertification = (cert: string) => {
    if (!formData.certificationsRequired.includes(cert)) {
      updateFormData({
        certificationsRequired: [...formData.certificationsRequired, cert],
      });
    }
    setCertSearch("");
  };

  const removeCertification = (cert: string) => {
    updateFormData({
      certificationsRequired: formData.certificationsRequired.filter(c => c !== cert),
    });
  };

  const filteredCerts = commonCertifications.filter(
    cert => 
      cert.toLowerCase().includes(certSearch.toLowerCase()) &&
      !formData.certificationsRequired.includes(cert)
  );

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-start justify-between gap-8">
        {/* Main Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs font-medium text-primary mb-2">
            <span>STEP 4 OF 5</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-text-main dark:text-white mb-3">
            Requirements & Details
          </h2>
          <p className="text-text-sub dark:text-gray-400 mb-8">
            Define who you are looking for and what they need to know. Clear requirements help you find the right talent faster.
          </p>

          {/* Mandatory Requirements */}
          <div className="mb-8">
            <h3 className="font-semibold text-text-main dark:text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Mandatory Requirements
            </h3>
            <p className="text-sm text-text-sub mb-4">Certifications Required</p>

            {/* Search Input */}
            <div className="relative mb-4">
              <input
                type="text"
                value={certSearch}
                onChange={(e) => setCertSearch(e.target.value)}
                placeholder="Search certifications (e.g. NASM, RYT-200)..."
                className="w-full px-4 py-3 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg text-text-main dark:text-white"
              />
              
              {/* Dropdown */}
              {certSearch && filteredCerts.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {filteredCerts.map(cert => (
                    <button
                      key={cert}
                      onClick={() => addCertification(cert)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm text-text-main dark:text-white"
                    >
                      {cert}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Certifications */}
            <div className="flex flex-wrap gap-2">
              {formData.certificationsRequired.map(cert => (
                <span
                  key={cert}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium"
                >
                  {cert}
                  <button onClick={() => removeCertification(cert)} className="hover:text-primary-dark">
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Experience Level */}
          <div className="mb-8">
            <h3 className="font-semibold text-text-main dark:text-white mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-text-sub" />
              Experience Level
            </h3>
            <p className="text-sm text-text-sub mb-4">Minimum Years of Experience</p>

            <div className="grid grid-cols-3 gap-4">
              {experienceLevels.map(({ level, label, years }) => (
                <button
                  key={level}
                  onClick={() => updateFormData({ experienceLevel: level })}
                  className={`relative p-4 rounded-xl border-2 transition-all text-center ${
                    formData.experienceLevel === level
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  }`}
                >
                  {formData.experienceLevel === level && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <span className={`font-medium block ${
                    formData.experienceLevel === level 
                      ? "text-text-main dark:text-white" 
                      : "text-text-sub"
                  }`}>
                    {label}
                  </span>
                  <span className="text-xs text-text-sub">{years}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes for Instructor */}
          <div>
            <h3 className="font-semibold text-text-main dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-text-sub" />
              Notes for the Instructor
            </h3>
            <p className="text-sm text-text-sub mb-4">Class Vibe, Playlist & Logistics (Optional)</p>
            <textarea
              value={formData.notes || ""}
              onChange={(e) => updateFormData({ notes: e.target.value })}
              placeholder="Describe the energy you're looking for, specific playlist genres (e.g. 90s Hip-Hop), or studio arrival instructions..."
              className="w-full px-4 py-3 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg text-text-main dark:text-white min-h-[120px] resize-none"
              maxLength={500}
            />
            <div className="text-right text-xs text-text-sub mt-1">
              {formData.notes?.length || 0}/500 characters
            </div>
          </div>
        </div>

        {/* Gig Summary Sidebar */}
        <div className="hidden lg:block w-72 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 sticky top-8">
          <h4 className="text-xs font-medium text-text-sub mb-3 uppercase tracking-wide">
            Gig Summary
          </h4>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-primary text-lg">🧘</span>
              </div>
              <div>
                <h5 className="font-semibold text-text-main dark:text-white text-sm">
                  {formData.customClassType || formData.classType} Class
                </h5>
                <p className="text-xs text-text-sub">
                  {formData.classType}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-text-sub">
                <span>📅</span>
                <span>{formData.date ? new Date(formData.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : "Not set"}</span>
              </div>
              <div className="flex items-center gap-2 text-text-sub">
                <span>⏰</span>
                <span>{formData.startTime || "7:00 AM"} - {formData.endTime || "8:00 AM"}</span>
              </div>
              <div className="flex items-center gap-2 text-text-sub">
                <span>💰</span>
                <span>
                  {formData.payType === "range" 
                    ? `$${formData.payMin || 0} - $${formData.payMax || 0}`
                    : `$${formData.payAmount || 0} ${formData.payType === "flat_fee" ? "Flat Rate" : "/hr"}`
                  }
                </span>
              </div>
              <div className="flex items-center gap-2 text-text-sub">
                <span>📍</span>
                <span>{formData.location || "Location not set"}</span>
              </div>
            </div>
          </div>

          {/* Pro Tip */}
          <div className="mt-6 p-4 bg-primary/10 rounded-lg">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-xs text-text-main dark:text-white">
                <span className="font-semibold text-primary">Pro Tip:</span> Instructors are 3x more likely to apply to gigs with specific details about the playlist vibe.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
