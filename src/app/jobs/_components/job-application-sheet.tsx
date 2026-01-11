"use client";

import React, { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
} from "@/components/ui/sheet";
import { JobWithStudio, ApplicationStatus } from "@/types";
import { Button } from "@/components/ui/button";
import {
  X,
  Share2,
  Bookmark,
  BookmarkCheck,
  MapPin,
  Clock,
  Timer,
  Users,
  Check,
  Loader2,
  CheckCircle,
} from "lucide-react";
import Image from "next/image";
import { useAuth } from '@/store/firebase-auth-provider';
import { 
  applyToJob, 
  getApplicationStatus, 
  saveJob, 
  unsaveJob, 
  isJobSaved,
  withdrawApplication 
} from "@/services/jobService";

interface JobApplicationSheetProps {
  job: JobWithStudio;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function JobApplicationSheet({
  job,
  isOpen,
  onOpenChange,
}: JobApplicationSheetProps) {
  const { user } = useAuth();
  const [isApplying, setIsApplying] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus>({ hasApplied: false });
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const matchPercentage = Math.floor(Math.random() * (98 - 85 + 1) + 85);
  const logoUrl = job.studio?.images?.[0];

  // Check application status and saved status when sheet opens
  useEffect(() => {
    if (isOpen && user) {
      checkStatus();
    }
  }, [isOpen, user, job.id]);

  const checkStatus = async () => {
    if (!user) return;
    
    try {
      const [appStatus, savedStatus] = await Promise.all([
        getApplicationStatus(job.id, user.uid),
        isJobSaved(user.uid, job.id)
      ]);
      setApplicationStatus(appStatus);
      setIsSaved(savedStatus);
    } catch (err) {
      console.error("Error checking status:", err);
    }
  };

  const handleApply = async () => {
    if (!user) {
      setError("Please sign in to apply");
      return;
    }

    try {
      setIsApplying(true);
      setError(null);
      await applyToJob(job.id, user.uid);
      setApplicationStatus({ hasApplied: true, status: "pending" });
    } catch (err: any) {
      setError(err.message || "Failed to apply");
    } finally {
      setIsApplying(false);
    }
  };

  const handleSaveToggle = async () => {
    if (!user) {
      setError("Please sign in to save jobs");
      return;
    }

    try {
      setIsSaving(true);
      if (isSaved) {
        await unsaveJob(user.uid, job.id);
        setIsSaved(false);
      } else {
        await saveJob(user.uid, job.id);
        setIsSaved(true);
      }
    } catch (err) {
      console.error("Error saving job:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleWithdraw = async () => {
    if (!applicationStatus.applicationId) return;
    
    try {
      setIsApplying(true);
      await withdrawApplication(applicationStatus.applicationId);
      setApplicationStatus({ hasApplied: false });
    } catch (err) {
      console.error("Error withdrawing application:", err);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full min-w-2xl p-0 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <SheetHeader className="border-b border-slate-100 dark:border-gray-800/50 bg-white dark:bg-[#152a1c] px-8 py-6 gap-0">
          <div className="flex items-start justify-between mb-4 w-full">
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-full p-2 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors -ml-2 group"
            >
              <X className="w-5 h-5 text-slate-400 group-hover:text-primary dark:text-gray-400 dark:group-hover:text-white transition-colors" />
            </button>
            <div className="flex gap-2">
              <button 
                onClick={handleSaveToggle}
                disabled={isSaving}
                className="p-2 text-slate-400 hover:text-primary dark:hover:text-white transition-colors"
              >
                {isSaved ? (
                  <BookmarkCheck className="w-5 h-5 text-green-600" />
                ) : (
                  <Bookmark className="w-5 h-5" />
                )}
              </button>
              <button className="p-2 text-slate-400 hover:text-primary dark:hover:text-white transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex gap-5 items-center w-full">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={job.studio?.name || "Studio"}
                width={64}
                height={64}
                className="h-16 w-16 rounded-full border-2 border-white dark:border-gray-700 shadow-md shrink-0 object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 border-2 border-white dark:border-gray-700 shadow-md flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-lg">
                  {job.studio?.name?.[0] || "F"}
                </span>
              </div>
            )}

            <div className="flex flex-col w-full">
              <div className="flex justify-between items-start w-full">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {job.position}
                  </h2>
                  <p className="text-slate-500 dark:text-gray-400 font-normal mt-0.5">
                    {job.studio?.name}
                  </p>
                </div>
                <div className="text-right">
                  <span className="block text-xl font-bold text-slate-900 dark:text-white">
                    {job.compensation.split("/")[0]}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wide font-medium">
                    {job.compensation.includes("hour")
                      ? "Per Hour"
                      : "Per Class"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </SheetHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6 bg-white dark:bg-[#152a1c]">
          {/* Match Score */}
          <div className="mb-8 bg-slate-50 dark:bg-gray-900/50 rounded-xl p-5 flex flex-col gap-3">
            <div className="flex justify-between items-end">
              <span className="text-sm font-semibold text-slate-900 dark:text-gray-200">
                Your Match Score
              </span>
              <span className="text-sm font-bold text-green-600 dark:text-green-400">
                {matchPercentage}%
              </span>
            </div>
            <div className="h-2 w-full bg-slate-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-600 rounded-full shadow-[0_0_10px_rgba(22,163,74,0.5)]"
                style={{ width: `${matchPercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
              Great fit based on your certifications and experience.
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-lg bg-white dark:bg-gray-800/30 border border-slate-100 dark:border-gray-800/50 shadow-sm">
              <div className="flex items-center gap-2 mb-1 text-slate-500 dark:text-gray-400">
                <MapPin className="w-4 h-4" />
                <span className="text-xs uppercase font-medium tracking-wide">
                  Location
                </span>
              </div>
              <p className="text-sm font-medium text-slate-900 dark:text-gray-200">
                {job.studio?.location || "TBD"}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-white dark:bg-gray-800/30 border border-slate-100 dark:border-gray-800/50 shadow-sm">
              <div className="flex items-center gap-2 mb-1 text-slate-500 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span className="text-xs uppercase font-medium tracking-wide">
                  Start Date
                </span>
              </div>
              <p className="text-sm font-medium text-slate-900 dark:text-gray-200">
                {new Date(job.start_date).toLocaleDateString()}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-white dark:bg-gray-800/30 border border-slate-100 dark:border-gray-800/50 shadow-sm">
              <div className="flex items-center gap-2 mb-1 text-slate-500 dark:text-gray-400">
                <Timer className="w-4 h-4" />
                <span className="text-xs uppercase font-medium tracking-wide">
                  Type
                </span>
              </div>
              <p className="text-sm font-medium text-slate-900 dark:text-gray-200">
                {job.compensation.includes("year") ? "Full-time" : "Contract"}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-white dark:bg-gray-800/30 border border-slate-100 dark:border-gray-800/50 shadow-sm">
              <div className="flex items-center gap-2 mb-1 text-slate-500 dark:text-gray-400">
                <Users className="w-4 h-4" />
                <span className="text-xs uppercase font-medium tracking-wide">
                  Styles
                </span>
              </div>
              <p className="text-sm font-medium text-slate-900 dark:text-gray-200">
                {job.styles?.[0] || "Various"}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">
              About This Opportunity
            </h3>
            <p className="text-slate-600 dark:text-gray-300 text-sm leading-relaxed">
              {job.description}
            </p>
          </div>

          {/* Requirements */}
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">
              Requirements
            </h3>
            <div className="flex flex-col gap-3">
              {job.requirements?.map((req, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-gray-700 bg-white dark:bg-transparent"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 dark:bg-green-900/40 rounded-full p-1 text-green-600 dark:text-green-400">
                      <Check className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-slate-900 dark:text-gray-200">
                      {req}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <SheetFooter className="border-t border-slate-100 dark:border-gray-800 bg-white dark:bg-[#152a1c] px-6 py-6">
          <div className="w-full space-y-4">
            {error && (
              <p className="text-xs text-red-500 text-center">{error}</p>
            )}
            
            {applicationStatus.hasApplied ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 py-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-700 dark:text-green-400 font-medium">
                    {applicationStatus.status === "pending" && "Application Submitted"}
                    {applicationStatus.status === "accepted" && "Application Accepted! 🎉"}
                    {applicationStatus.status === "rejected" && "Application Not Selected"}
                    {applicationStatus.status === "invited" && "You've Been Invited!"}
                  </span>
                </div>
                {applicationStatus.status === "pending" && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleWithdraw}
                    disabled={isApplying}
                  >
                    {isApplying ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Withdraw Application
                  </Button>
                )}
              </div>
            ) : (
              <>
                <p className="text-xs text-slate-400 dark:text-gray-400 text-center">
                  By applying, you agree to the studio's terms and conditions.
                </p>
                <Button 
                  className="w-full h-12 bg-green-600 hover:bg-green-700 active:scale-[0.99] transition-all rounded-lg text-white font-bold flex items-center justify-center gap-2"
                  onClick={handleApply}
                  disabled={isApplying || !user}
                >
                  {isApplying ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>{user ? "1-Click Apply" : "Sign in to Apply"}</span>
                      <span>→</span>
                    </>
                  )}
                </Button>
                <p className="text-xs text-slate-400 dark:text-gray-500 text-center font-medium">
                  ⚡️ Average response time: 2 hours
                </p>
              </>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
