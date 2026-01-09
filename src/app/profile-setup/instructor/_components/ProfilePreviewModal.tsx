import React from "react";
import { Mail, MapPin, Briefcase, Calendar, Image as ImageIcon, Award } from "lucide-react";
import { Profile, Experience, Certification } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProfilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Partial<Profile>;
}

export default function ProfilePreviewModal({
  isOpen,
  onClose,
  profile,
}: ProfilePreviewModalProps) {
  const galleryImages = profile.gallery_images || [];
  const experiences = profile.experience || [];
  const certifications = profile.certification_details || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Profile Preview</DialogTitle>
          <DialogDescription>
            This is how your profile will appear to studios
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 py-4">
          {/* Header Section */}
          <div className="border-b border-slate-200 dark:border-slate-800 pb-8">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="shrink-0">
                {profile.profile_photo ? (
                  <img
                    src={profile.profile_photo}
                    alt={profile.full_name}
                    className="h-24 w-24 rounded-full object-cover border-4 border-emerald-500"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold">
                    {profile.full_name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {profile.full_name || "Your Name"}
                </h1>
                <p className="text-lg text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                  {profile.headline || "Your Headline"}
                </p>
                <p className="text-slate-600 dark:text-slate-400 mt-3">
                  {profile.bio || "Add a bio to tell studios about yourself"}
                </p>

                {/* Contact Info */}
                <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-500">
                  {profile.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={16} />
                      {profile.email}
                    </div>
                  )}
                  {profile.location && (
                    <div className="flex items-center gap-2">
                      <MapPin size={16} />
                      {profile.location}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Work Experience */}
          {experiences.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Briefcase size={20} className="text-emerald-500" />
                Work Experience
              </h2>
              <div className="space-y-4">
                {experiences.map((exp: Experience, idx: number) => (
                  <div key={idx} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {exp.title}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {exp.company}
                        </p>
                      </div>
                      {exp.isActive && (
                        <span className="text-xs font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      {exp.period}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Award size={20} className="text-emerald-500" />
                Certifications
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {certifications.map((cert: Certification, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <p className="font-medium text-slate-900 dark:text-white text-sm">
                      {cert.title}
                    </p>
                    {cert.issued && (
                      <p className="text-xs text-slate-500">{cert.issued}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Availability */}
          {profile.availability_slots && profile.availability_slots.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Calendar size={20} className="text-emerald-500" />
                Availability
              </h2>
              <div className="flex flex-wrap gap-2">
                {profile.availability_slots.map((slot: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium rounded-full"
                  >
                    {slot}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Gallery */}
          {galleryImages.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <ImageIcon size={20} className="text-emerald-500" />
                Photo Gallery
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {galleryImages.map((img: string, idx: number) => (
                  <div
                    key={idx}
                    className="aspect-square rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700"
                  >
                    <div
                      className="w-full h-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${img})` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status Info */}
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-400">
              <span className="font-semibold">Ready to submit?</span> Once you submit your profile, it will be reviewed and added to our instructor directory.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
