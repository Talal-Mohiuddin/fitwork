"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Briefcase,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  TrendingUp,
  Eye,
  Shield,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getInstructorStats,
  getJobStats,
  getPendingInstructors,
  verifyInstructor,
  rejectInstructor,
  InstructorWithStatus,
} from "@/services/adminService";
import { getOptimizedCloudinaryUrl } from "@/lib/cloudinary";

export default function AdminDashboard() {
  const [instructorStats, setInstructorStats] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    rejected: 0,
    draft: 0,
  });
  const [jobStats, setJobStats] = useState({
    total: 0,
    open: 0,
    closed: 0,
    applications: 0,
  });
  const [pendingInstructors, setPendingInstructors] = useState<InstructorWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [iStats, jStats, pending] = await Promise.all([
        getInstructorStats(),
        getJobStats(),
        getPendingInstructors(),
      ]);
      setInstructorStats(iStats);
      setJobStats(jStats);
      setPendingInstructors(pending);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (instructorId: string) => {
    try {
      setActionLoading(instructorId);
      await verifyInstructor(instructorId);
      // Remove from pending list
      setPendingInstructors((prev) =>
        prev.filter((i) => i.id !== instructorId)
      );
      // Update stats
      setInstructorStats((prev) => ({
        ...prev,
        pending: prev.pending - 1,
        verified: prev.verified + 1,
      }));
    } catch (error) {
      console.error("Error verifying instructor:", error);
      alert("Failed to verify instructor");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (instructorId: string) => {
    if (!rejectReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }
    try {
      setActionLoading(instructorId);
      await rejectInstructor(instructorId, rejectReason);
      // Remove from pending list
      setPendingInstructors((prev) =>
        prev.filter((i) => i.id !== instructorId)
      );
      // Update stats
      setInstructorStats((prev) => ({
        ...prev,
        pending: prev.pending - 1,
        rejected: prev.rejected + 1,
      }));
      setRejectModalOpen(null);
      setRejectReason("");
    } catch (error) {
      console.error("Error rejecting instructor:", error);
      alert("Failed to reject instructor");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Manage instructors, jobs, and platform settings
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Instructors */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Total Instructors
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                  {instructorStats.total}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-emerald-600 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +12%
              </span>
              <span className="text-slate-500">from last month</span>
            </div>
          </div>

          {/* Pending Verification */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Pending Verification
                </p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">
                  {instructorStats.pending}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link
                href="#pending"
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Review now →
              </Link>
            </div>
          </div>

          {/* Verified Instructors */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Verified Instructors
                </p>
                <p className="text-3xl font-bold text-emerald-600 mt-1">
                  {instructorStats.verified}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-slate-500">
                {Math.round((instructorStats.verified / instructorStats.total) * 100) || 0}% of total
              </span>
            </div>
          </div>

          {/* Active Jobs */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Active Jobs
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                  {jobStats.open}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-slate-500">
                {jobStats.applications} applications received
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/admin/instructors">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    Manage Instructors
                  </p>
                  <p className="text-sm text-slate-500">View all instructor profiles</p>
                </div>
              </div>
            </div>
          </Link>
          <Link href="/admin/jobs">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    Manage Jobs
                  </p>
                  <p className="text-sm text-slate-500">Review job postings</p>
                </div>
              </div>
            </div>
          </Link>
          <Link href="/jobs/post/wizard">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    Create Job
                  </p>
                  <p className="text-sm text-slate-500">Post a new job listing</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Pending Instructors Section */}
        <div id="pending" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Pending Verification
                  </h2>
                  <p className="text-sm text-slate-500">
                    {pendingInstructors.length} instructors awaiting review
                  </p>
                </div>
              </div>
            </div>
          </div>

          {pendingInstructors.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">
                All caught up! No pending verifications.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {pendingInstructors.map((instructor) => (
                <div
                  key={instructor.id}
                  className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Profile Photo */}
                    <div className="w-16 h-16 rounded-xl bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0">
                      {instructor.profile_photo ? (
                        <img
                          src={getOptimizedCloudinaryUrl(instructor.profile_photo, {
                            width: 128,
                            height: 128,
                          })}
                          alt={instructor.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-slate-400">
                          {instructor.full_name?.charAt(0) || "?"}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {instructor.full_name}
                        </h3>
                        <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-medium rounded-full">
                          Pending
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        {instructor.headline}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                        <span>{instructor.location}</span>
                        <span>{instructor.email}</span>
                        <span>
                          Submitted:{" "}
                          {instructor.submittedAt
                            ? new Date(instructor.submittedAt).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                      {/* Fitness Styles */}
                      <div className="flex flex-wrap gap-1 mt-3">
                        {instructor.fitness_styles?.slice(0, 4).map((style) => (
                          <span
                            key={style}
                            className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded"
                          >
                            {style}
                          </span>
                        ))}
                        {(instructor.fitness_styles?.length || 0) > 4 && (
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded">
                            +{(instructor.fitness_styles?.length || 0) - 4} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Link href={`/instructors/${instructor.id}`}>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        className="bg-emerald-500 hover:bg-emerald-600 text-white gap-1"
                        onClick={() => handleVerify(instructor.id!)}
                        disabled={actionLoading === instructor.id}
                      >
                        {actionLoading === instructor.id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Shield className="w-4 h-4" />
                            Verify
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20 gap-1"
                        onClick={() => setRejectModalOpen(instructor.id!)}
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </Button>
                    </div>
                  </div>

                  {/* Reject Modal */}
                  {rejectModalOpen === instructor.id && (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-red-700 dark:text-red-400 mb-2">
                            Provide a reason for rejection
                          </p>
                          <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="e.g., Incomplete profile, invalid certifications, etc."
                            className="w-full px-3 py-2 border border-red-200 dark:border-red-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                            rows={3}
                          />
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              className="bg-red-600 hover:bg-red-700 text-white"
                              onClick={() => handleReject(instructor.id!)}
                              disabled={actionLoading === instructor.id}
                            >
                              Confirm Rejection
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setRejectModalOpen(null);
                                setRejectReason("");
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
