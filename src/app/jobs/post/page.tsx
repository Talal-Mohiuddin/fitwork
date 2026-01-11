"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft, 
  Briefcase, 
  DollarSign, 
  Calendar, 
  MapPin,
  Loader2,
  CheckCircle,
  Plus,
  X,
  Save,
  AlertCircle
} from "lucide-react";
import { createJob } from "@/services/jobService";
import { useAuth } from '@/store/firebase-auth-provider';
import Link from "next/link";

const fitnessStyles = [
  "HIIT",
  "Strength Training",
  "Functional Training",
  "CrossFit",
  "Olympic Weightlifting",
  "Kettlebell Training",
  "Calisthenics / Bodyweight",
  "Yoga",
  "Hot Yoga",
  "Pilates (Mat)",
  "Reformer Pilates",
  "Breathwork",
  "Barre",
  "Dance Fitness",
  "Spinning",
  "Running Coaching",
  "Aqua Fitness",
  "Bootcamp",
];

const compensationTypes = [
  { value: "per-class", label: "Per Class" },
  { value: "per-hour", label: "Per Hour" },
  { value: "monthly", label: "Monthly" },
  { value: "negotiable", label: "Negotiable" },
];

export default function PostJobPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("info");
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});
  
  const [formData, setFormData] = useState({
    position: "",
    description: "",
    compensation: "",
    compensationType: "per-class",
    startDate: "",
    endDate: "",
    styles: [] as string[],
    requirements: [] as string[],
  });
  
  const [newRequirement, setNewRequirement] = useState("");

  // Auto-save draft functionality
  useEffect(() => {
    const autoSave = setTimeout(() => {
      if (hasFormData() && !isSubmitting && !isSuccess) {
        saveDraft();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearTimeout(autoSave);
  }, [formData]);

  // Toast notification helper
  const showToastNotification = (message: string, type: "success" | "error" | "info" = "info") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  // Check if form has any data
  const hasFormData = () => {
    return formData.position.trim() || 
           formData.description.trim() || 
           formData.compensation.trim() || 
           formData.styles.length > 0 ||
           formData.requirements.length > 0;
  };

  // Save draft to localStorage
  const saveDraft = async () => {
    if (!hasFormData()) return;

    try {
      setIsDraftSaving(true);
      const draftData = {
        ...formData,
        savedAt: new Date().toISOString(),
        userId: user?.uid
      };
      localStorage.setItem('jobDraft', JSON.stringify(draftData));
      setLastSaved(new Date());
      showToastNotification("Draft saved automatically", "info");
    } catch (error) {
      console.error('Failed to save draft:', error);
    } finally {
      setIsDraftSaving(false);
    }
  };

  // Load draft from localStorage
  const loadDraft = () => {
    try {
      const draft = localStorage.getItem('jobDraft');
      if (draft) {
        const draftData = JSON.parse(draft);
        if (draftData.userId === user?.uid) {
          setFormData({
            position: draftData.position || "",
            description: draftData.description || "",
            compensation: draftData.compensation || "",
            compensationType: draftData.compensationType || "per-class",
            startDate: draftData.startDate || "",
            endDate: draftData.endDate || "",
            styles: draftData.styles || [],
            requirements: draftData.requirements || [],
          });
          showToastNotification("Draft loaded successfully", "info");
        }
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
  };

  // Clear draft
  const clearDraft = () => {
    localStorage.removeItem('jobDraft');
    setLastSaved(null);
    showToastNotification("Draft cleared", "info");
  };

  // Form validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.position.trim()) {
      errors.position = "Position title is required";
    }
    if (!formData.description.trim()) {
      errors.description = "Job description is required";
    }
    if (!formData.compensation.trim() && formData.compensationType !== "negotiable") {
      errors.compensation = "Compensation amount is required";
    }
    if (!formData.startDate) {
      errors.startDate = "Start date is required";
    }
    if (formData.styles.length === 0) {
      errors.styles = "Please select at least one fitness style";
    }
    if (formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      errors.endDate = "End date must be after start date";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleStyleToggle = (style: string) => {
    setFormData((prev) => ({
      ...prev,
      styles: prev.styles.includes(style)
        ? prev.styles.filter((s) => s !== style)
        : [...prev.styles, style],
    }));
  };

  const handleAddRequirement = () => {
    if (newRequirement.trim()) {
      setFormData((prev) => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()],
      }));
      setNewRequirement("");
    }
  };

  const handleRemoveRequirement = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError("Please sign in to post a job");
      showToastNotification("Please sign in to post a job", "error");
      return;
    }

    if (profile?.user_type !== "studio") {
      setError("Only studios can post jobs");
      showToastNotification("Only studios can post jobs", "error");
      return;
    }

    // Validate form
    if (!validateForm()) {
      showToastNotification("Please fix the errors below", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const compensation = formData.compensationType === "negotiable"
        ? "Negotiable"
        : `$${formData.compensation}/${formData.compensationType === "per-class" ? "class" : formData.compensationType === "per-hour" ? "hour" : "month"}`;

      await createJob(user.uid, {
        position: formData.position,
        description: formData.description,
        compensation,
        start_date: formData.startDate,
        end_date: formData.endDate || null,
        styles: formData.styles,
        requirements: formData.requirements,
        studio_id: user.uid,
      });

      // Clear draft after successful submission
      clearDraft();

      setIsSuccess(true);
      showToastNotification("Job posted successfully!", "success");
      
      // Redirect after success
      setTimeout(() => {
        router.push("/dashboard/studio");
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to post job";
      setError(errorMessage);
      showToastNotification(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manual save draft
  const handleSaveDraft = async () => {
    await saveDraft();
  };

  // Load draft on component mount
  useEffect(() => {
    if (user) {
      loadDraft();
    }
  }, [user]);

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#F9FAFC] dark:bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Job Posted Successfully!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your job listing is now live. Redirecting to dashboard...
          </p>
          <Link href="/jobs">
            <Button variant="outline">View All Jobs</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFC] dark:bg-background-dark">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 ${
            toastType === "success" ? "bg-green-50 border border-green-200 text-green-800" :
            toastType === "error" ? "bg-red-50 border border-red-200 text-red-800" :
            "bg-blue-50 border border-blue-200 text-blue-800"
          }`}>
            {toastType === "success" && <CheckCircle className="w-5 h-5 text-green-600" />}
            {toastType === "error" && <AlertCircle className="w-5 h-5 text-red-600" />}
            {toastType === "info" && <Save className="w-5 h-5 text-blue-600" />}
            <span className="text-sm font-medium">{toastMessage}</span>
            <button 
              onClick={() => setShowToast(false)}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard/studio"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Post a New Job
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Find the perfect instructor for your studio
              </p>
            </div>
            <div className="flex items-center gap-3">
              {lastSaved && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </span>
              )}
              {hasFormData() && (
                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={isDraftSaving}
                  className="flex items-center gap-2"
                >
                  {isDraftSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isDraftSaving ? "Saving..." : "Save Draft"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Position Title */}
          <div className="bg-white dark:bg-[#1a2c35] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-3">
              <Briefcase className="w-4 h-4 text-green-600" />
              Position Title *
            </label>
            <Input
              value={formData.position}
              onChange={(e) => handleChange("position", e.target.value)}
              placeholder="e.g., Yoga Instructor, CrossFit Coach"
              className={`h-12 ${validationErrors.position ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
            />
            {validationErrors.position && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.position}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="bg-white dark:bg-[#1a2c35] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Job Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Describe the role, responsibilities, and what you're looking for..."
              rows={5}
              className={`w-full px-4 py-3 rounded-lg border bg-white dark:bg-[#1a2c35] text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 ${
                validationErrors.description 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-200 dark:border-gray-700 focus:ring-green-600'
              }`}
            />
            {validationErrors.description && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.description}
              </p>
            )}
          </div>

          {/* Compensation */}
          <div className="bg-white dark:bg-[#1a2c35] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-3">
              <DollarSign className="w-4 h-4 text-green-600" />
              Compensation *
            </label>
            <div className="flex gap-4">
              <Input
                type="number"
                value={formData.compensation}
                onChange={(e) => handleChange("compensation", e.target.value)}
                placeholder="Amount"
                className={`h-12 flex-1 ${validationErrors.compensation ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                disabled={formData.compensationType === "negotiable"}
              />
              <Select
                value={formData.compensationType}
                onValueChange={(value) => handleChange("compensationType", value)}
              >
                <SelectTrigger className="w-40 h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {compensationTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {validationErrors.compensation && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.compensation}
              </p>
            )}
          </div>

          {/* Dates */}
          <div className="bg-white dark:bg-[#1a2c35] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-3">
              <Calendar className="w-4 h-4 text-green-600" />
              Duration
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Start Date *
                </label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                  className={`h-12 ${validationErrors.startDate ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
                {validationErrors.startDate && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {validationErrors.startDate}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  End Date (optional)
                </label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange("endDate", e.target.value)}
                  className={`h-12 ${validationErrors.endDate ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
                {validationErrors.endDate && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {validationErrors.endDate}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Fitness Styles */}
          <div className="bg-white dark:bg-[#1a2c35] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Fitness Styles Required *
            </label>
            <div className="flex flex-wrap gap-2">
              {fitnessStyles.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => handleStyleToggle(style)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.styles.includes(style)
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
            {validationErrors.styles && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.styles}
              </p>
            )}
          </div>

          {/* Requirements */}
          <div className="bg-white dark:bg-[#1a2c35] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Requirements (optional)
            </label>
            <div className="flex gap-2 mb-4">
              <Input
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                placeholder="e.g., 2+ years experience"
                className="h-10"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddRequirement();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddRequirement}
                className="h-10 px-4"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.requirements.length > 0 && (
              <div className="space-y-2">
                {formData.requirements.map((req, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {req}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRequirement(idx)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-3 flex-1">
              <Link href="/dashboard/studio" className="flex-1">
                <Button variant="outline" className="w-full h-12">
                  Cancel
                </Button>
              </Link>
              {hasFormData() && (
                <Button
                  variant="outline"
                  onClick={clearDraft}
                  className="flex-1 h-12 border-red-200 text-red-600 hover:bg-red-50"
                >
                  Clear Draft
                </Button>
              )}
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Briefcase className="w-4 h-4 mr-2" />
                  Post Job
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
