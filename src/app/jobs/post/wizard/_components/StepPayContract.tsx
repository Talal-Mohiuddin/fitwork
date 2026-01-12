"use client";

import { JobPostingData, PayType, EmploymentStatus, CancellationPolicy } from "@/types";
import { FileText, Clock } from "lucide-react";

interface StepPayContractProps {
  formData: JobPostingData;
  updateFormData: (updates: Partial<JobPostingData>) => void;
}

const payTypes: { type: PayType; label: string }[] = [
  { type: "flat_fee", label: "Flat Fee" },
  { type: "hourly", label: "Hourly Rate" },
  { type: "range", label: "Range" },
];

const employmentTypes: { type: EmploymentStatus; label: string; description: string }[] = [
  { type: "contractor", label: "Contractor (1099)", description: "Freelance, no benefits provided." },
  { type: "employee", label: "Employee (W2)", description: "Standard employment with benefits." },
];

const cancellationPolicies: { type: CancellationPolicy; label: string; description: string }[] = [
  { type: "standard", label: "Standard", description: "24hr notice required for cancellation." },
  { type: "flexible", label: "Flexible", description: "12hr notice required. No fee if rebooked." },
  { type: "strict", label: "Strict", description: "No cancellations within 48hrs. Full fee charged." },
];

export default function StepPayContract({ formData, updateFormData }: StepPayContractProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold text-text-main dark:text-white mb-3">
        How will this pro be paid?
      </h2>
      <p className="text-text-sub dark:text-gray-400 mb-8">
        Define the rates and terms for this gig to ensure transparency.
      </p>

      {/* Pay Type Selection */}
      <div className="mb-8">
        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg inline-flex">
          {payTypes.map(({ type, label }) => (
            <button
              key={type}
              onClick={() => updateFormData({ payType: type })}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                formData.payType === type
                  ? "bg-white dark:bg-surface-dark shadow text-primary"
                  : "text-text-sub hover:text-text-main dark:hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Pay Amount */}
      <div className="mb-8">
        {formData.payType === "range" ? (
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-text-sub">$</span>
              <input
                type="number"
                value={formData.payMin || ""}
                onChange={(e) => updateFormData({ payMin: parseFloat(e.target.value) || 0 })}
                placeholder="Min"
                className="w-full pl-10 pr-4 py-4 text-2xl font-semibold bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg text-text-main dark:text-white"
              />
            </div>
            <span className="text-text-sub text-xl">-</span>
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-text-sub">$</span>
              <input
                type="number"
                value={formData.payMax || ""}
                onChange={(e) => updateFormData({ payMax: parseFloat(e.target.value) || 0 })}
                placeholder="Max"
                className="w-full pl-10 pr-4 py-4 text-2xl font-semibold bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg text-text-main dark:text-white"
              />
            </div>
          </div>
        ) : (
          <div className="relative max-w-xs">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl text-text-sub">$</span>
            <input
              type="number"
              value={formData.payAmount || ""}
              onChange={(e) => updateFormData({ payAmount: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
              className="w-full pl-12 pr-20 py-4 text-3xl font-semibold bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg text-text-main dark:text-white"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-sub">
              {formData.currency}
            </span>
          </div>
        )}
      </div>

      {/* Employment Status */}
      <div className="mb-8">
        <h3 className="font-semibold text-text-main dark:text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-text-sub" />
          Employment Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {employmentTypes.map(({ type, label, description }) => (
            <button
              key={type}
              onClick={() => updateFormData({ employmentStatus: type })}
              className={`text-left p-4 rounded-xl border-2 transition-all ${
                formData.employmentStatus === type
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
              }`}
            >
              <span className={`font-medium block ${
                formData.employmentStatus === type 
                  ? "text-text-main dark:text-white" 
                  : "text-text-sub"
              }`}>
                {label}
              </span>
              <span className="text-sm text-text-sub">{description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Cancellation Policy */}
      <div>
        <h3 className="font-semibold text-text-main dark:text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-text-sub" />
          Cancellation Policy
        </h3>
        <div className="space-y-3">
          {cancellationPolicies.map(({ type, label, description }) => (
            <button
              key={type}
              onClick={() => updateFormData({ cancellationPolicy: type })}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-4 ${
                formData.cancellationPolicy === type
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                formData.cancellationPolicy === type
                  ? "border-primary"
                  : "border-gray-300"
              }`}>
                {formData.cancellationPolicy === type && (
                  <div className="w-2.5 h-2.5 bg-primary rounded-full" />
                )}
              </div>
              <div>
                <span className={`font-medium block ${
                  formData.cancellationPolicy === type 
                    ? "text-text-main dark:text-white" 
                    : "text-text-sub"
                }`}>
                  {label}
                </span>
                <span className="text-sm text-text-sub">{description}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
