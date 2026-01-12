"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Loader2, Send, Calendar, MapPin, DollarSign, Clock } from "lucide-react";
import { Profile, JobWithStudio } from "@/types";
import { getStudioJobs } from "@/services/jobService";
import { startConversationWithJobOffer } from "@/services/chatService";
import { useAuth } from "@/store/firebase-auth-provider";
import { useRouter } from "next/navigation";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  instructor: Profile;
}

export default function InviteModal({ isOpen, onClose, instructor }: InviteModalProps) {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<JobWithStudio[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const loadJobs = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { jobs: studioJobs } = await getStudioJobs(user.uid);
      // Only show open jobs
      const openJobs = studioJobs.filter(job => job.status === "open");
      setJobs(openJobs);
      
      if (openJobs.length > 0) {
        setSelectedJobId(openJobs[0].id);
      }
    } catch (error) {
      console.error("Error loading jobs:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen && user) {
      loadJobs();
    }
  }, [isOpen, user, loadJobs]);

  const handleSendInvite = async () => {
    if (!user || !profile || !selectedJobId) return;

    const selectedJob = jobs.find(j => j.id === selectedJobId);
    if (!selectedJob) return;

    try {
      setIsSending(true);

      const studioName = profile.name || "Studio";
      const studioAvatar = profile.images?.[0];
      const instructorName = instructor.full_name || "Instructor";
      const instructorAvatar = instructor.profile_photo || instructor.images?.[0];

      // Get the job offer details matching JobOfferDetails interface
      const jobOfferDetails = {
        jobId: selectedJob.id,
        title: selectedJob.position,
        date: selectedJob.start_date || "",
        time: selectedJob.time_slot || "",
        location: selectedJob.studio?.location || "",
        studio: studioName,
        studioId: user.uid,
        rate: selectedJob.compensation,
        status: "pending" as const,
        classType: selectedJob.styles?.[0],
      };

      await startConversationWithJobOffer(
        user.uid,
        studioName,
        studioAvatar,
        instructor.id,
        instructorName,
        instructorAvatar,
        jobOfferDetails,
        message || undefined
      );

      // Redirect to chat
      router.push("/chat");
      onClose();
    } catch (error) {
      console.error("Error sending invite:", error);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  const selectedJob = jobs.find(j => j.id === selectedJobId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-lg mx-4 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-text-main dark:text-white">
              Invite to Gig
            </h2>
            <p className="text-sm text-text-sub dark:text-gray-400 mt-1">
              Send a job offer to {instructor.full_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-text-sub dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-text-sub dark:text-gray-400 mb-4">
                You don&apos;t have any open gigs to invite instructors to.
              </p>
              <button
                onClick={() => router.push("/jobs/post/wizard")}
                className="bg-primary text-white font-semibold px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
              >
                Post a Gig
              </button>
            </div>
          ) : (
            <>
              {/* Instructor Preview */}
              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <div 
                  className="w-14 h-14 rounded-full bg-cover bg-center bg-primary/10 flex items-center justify-center"
                  style={instructor.profile_photo ? { backgroundImage: `url(${instructor.profile_photo})` } : {}}
                >
                  {!instructor.profile_photo && (
                    <span className="text-primary font-bold text-lg">
                      {instructor.full_name?.charAt(0) || "U"}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-text-main dark:text-white">
                    {instructor.full_name}
                  </h3>
                  <p className="text-sm text-text-sub dark:text-gray-400">
                    {instructor.fitness_styles?.slice(0, 3).join(", ") || "Instructor"}
                  </p>
                </div>
              </div>

              {/* Select Job */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-text-main dark:text-white mb-2">
                  Select a Gig
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {jobs.map(job => (
                    <button
                      key={job.id}
                      onClick={() => setSelectedJobId(job.id)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        selectedJobId === job.id
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      <div className="font-semibold text-text-main dark:text-white mb-1">
                        {job.position}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-text-sub dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {job.start_date ? new Date(job.start_date).toLocaleDateString() : "TBD"}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {job.compensation}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Job Details */}
              {selectedJob && (
                <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                  <h4 className="text-xs font-semibold text-primary uppercase tracking-wide mb-3">
                    Gig Details
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-text-sub" />
                      <span className="text-text-main dark:text-white">
                        {selectedJob.start_date ? new Date(selectedJob.start_date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        }) : "Date TBD"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-text-sub" />
                      <span className="text-text-main dark:text-white">
                        {selectedJob.time_slot || "Time TBD"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-text-sub" />
                      <span className="text-text-main dark:text-white truncate">
                        {selectedJob.studio?.location || "Location TBD"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-text-sub" />
                      <span className="text-text-main dark:text-white font-semibold">
                        {selectedJob.compensation}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Personal Message */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-text-main dark:text-white mb-2">
                  Add a personal message (optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Hi! We'd love to have you cover this class..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-text-main dark:text-white placeholder:text-text-sub focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {jobs.length > 0 && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 shrink-0">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-text-main dark:text-white font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSendInvite}
              disabled={!selectedJobId || isSending}
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors shadow-md"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Send Invite
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
