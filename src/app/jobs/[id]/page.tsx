"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  Check,
  X,
  Loader2,
  Building2,
  Share2,
  Heart,
  Zap,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { JobWithStudio, ApplicationStatus } from "@/types";
import {
  getJobById,
  applyToJob,
  getApplicationStatus,
  saveJob,
  unsaveJob,
  isJobSaved,
} from "@/services/jobService";
import { useAuth } from "@/store/firebase-auth-provider";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  const jobId = params?.id as string;

  const [job, setJob] = useState<JobWithStudio | null>(null);
  const [loading, setLoading] = useState(true);
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const data = await getJobById(jobId);
        setJob(data);

        // Check if user has already applied
        if (user) {
          const status = await getApplicationStatus(jobId, user.uid);
          setApplicationStatus(status);

          // Check if job is saved
          const saved = await isJobSaved(user.uid, jobId);
          setIsSaved(saved);
        }
      } catch (err) {
        console.error("Error fetching job:", err);
        setError("Failed to load job details");
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJob();
    }
  }, [jobId, user]);

  const handleApply = async () => {
    if (!user || !profile) {
      router.push(`/login?redirect=/jobs/${jobId}`);
      return;
    }

    if (profile.user_type !== "instructor") {
      setError("Only instructors can apply to jobs");
      return;
    }

    if (!profile.profile_completed) {
      setError("Please complete your profile before applying");
      return;
    }

    setIsApplying(true);
    try {
      await applyToJob(jobId, user.uid, applicationMessage || undefined);
      setApplicationStatus({ hasApplied: true, status: "pending" });
      setShowApplicationForm(false);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to submit application";
      setError(errorMessage);
    } finally {
      setIsApplying(false);
    }
  };

  const handleToggleSave = async () => {
    if (!user) {
      router.push(`/login?redirect=/jobs/${jobId}`);
      return;
    }

    setIsSaving(true);
    try {
      if (isSaved) {
        await unsaveJob(user.uid, jobId);
        setIsSaved(false);
      } else {
        await saveJob(user.uid, jobId);
        setIsSaved(true);
      }
    } catch (err) {
      console.error("Error toggling save:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Job Not Found
          </h2>
          <Link href="/jobs">
            <Button>Browse Jobs</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/jobs"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-primary mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-4">
                {/* Studio Logo */}
                <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden shrink-0">
                  {job.studio.images && job.studio.images[0] ? (
                    <Image
                      src={job.studio.images[0]}
                      alt={job.studio.name || "Studio"}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <Building2 className="w-8 h-8 text-gray-400" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {job.urgent && (
                      <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        Urgent
                      </span>
                    )}
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        job.status === "open"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {job.status === "open" ? "Open" : "Closed"}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-text-main dark:text-white">
                    {job.position}
                  </h1>
                  <Link
                    href={`/studios/${job.studio_id}`}
                    className="text-primary font-medium hover:underline"
                  >
                    {job.studio.name}
                  </Link>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-6 text-gray-500 dark:text-gray-400 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{job.location || job.studio.location || "Location TBD"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Starts {formatDate(job.start_date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Posted {getTimeAgo(job.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-text-main dark:text-white mb-4">
                Job Description
              </h2>
              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                {job.description}
              </p>
            </div>

            {/* Styles */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-text-main dark:text-white mb-4">
                Fitness Styles
              </h2>
              <div className="flex flex-wrap gap-2">
                {job.styles.map((style) => (
                  <span
                    key={style}
                    className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium"
                  >
                    {style}
                  </span>
                ))}
              </div>
            </div>

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-text-main dark:text-white mb-4">
                  Requirements
                </h2>
                <ul className="space-y-2">
                  {job.requirements.map((req, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-gray-600 dark:text-gray-300"
                    >
                      <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Apply Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-6 h-6 text-primary" />
                <span className="text-2xl font-bold text-text-main dark:text-white">
                  {job.compensation}
                </span>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              {applicationStatus?.hasApplied ? (
                <div className="text-center">
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                      applicationStatus.status === "accepted"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : applicationStatus.status === "rejected"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : applicationStatus.status === "invited"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }`}
                  >
                    {applicationStatus.status === "accepted" && <Check className="w-4 h-4" />}
                    {applicationStatus.status === "rejected" && <X className="w-4 h-4" />}
                    {applicationStatus.status === "pending" && <Clock className="w-4 h-4" />}
                    Application {applicationStatus.status}
                  </div>
                </div>
              ) : job.status !== "open" ? (
                <Button className="w-full" disabled>
                  This Position is Closed
                </Button>
              ) : showApplicationForm ? (
                <div className="space-y-4">
                  <Textarea
                    placeholder="Tell the studio why you're a great fit for this position..."
                    value={applicationMessage}
                    onChange={(e) => setApplicationMessage(e.target.value)}
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowApplicationForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 bg-primary hover:bg-primary-dark text-white"
                      onClick={handleApply}
                      disabled={isApplying}
                    >
                      {isApplying ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Applying...
                        </>
                      ) : (
                        "Submit Application"
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Button
                    className="w-full bg-primary hover:bg-primary-dark text-white font-bold"
                    onClick={() => {
                      if (!user) {
                        router.push(`/login?redirect=/jobs/${jobId}`);
                      } else {
                        setShowApplicationForm(true);
                      }
                    }}
                  >
                    Apply Now
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleToggleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Heart
                          className={`w-4 h-4 mr-2 ${
                            isSaved ? "fill-red-500 text-red-500" : ""
                          }`}
                        />
                        {isSaved ? "Saved" : "Save Job"}
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Studio Info */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Link href={`/studios/${job.studio_id}`}>
                  <div className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded-lg transition-colors">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                      {job.studio.images && job.studio.images[0] ? (
                        <Image
                          src={job.studio.images[0]}
                          alt={job.studio.name || "Studio"}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <Building2 className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-text-main dark:text-white">
                        {job.studio.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {job.studio.location}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Share Button */}
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                }}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share This Job
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
