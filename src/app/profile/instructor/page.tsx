"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Mail,
  Phone,
  Star,
  Award,
  Briefcase,
  Clock,
  CheckCircle2,
  Edit2,
  Settings,
  Share2,
  ChevronRight,
  Dumbbell,
  Eye,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/store/firebase-auth-provider";
import { getInstructorProfile } from "@/services/instructorProfileService";
import type { Profile } from "@/types";
import { getOptimizedCloudinaryUrl } from "@/lib/cloudinary";

export default function InstructorProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      if (authLoading) return;

      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const instructorProfile = await getInstructorProfile(user.uid);
        
        if (!instructorProfile) {
          // No profile exists, redirect to setup
          router.push("/profile-setup/instructor");
          return;
        }

        console.log("Fetched instructor profile:", instructorProfile);
        setProfile(instructorProfile);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
          <p className="text-slate-500">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => router.push("/profile-setup/instructor")}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Set Up Profile
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const profilePhotoUrl = profile.profile_photo
    ? getOptimizedCloudinaryUrl(profile.profile_photo, { width: 300, height: 300 })
    : null;

  const isProfileComplete = profile.profile_completed;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Profile Header */}
      <div className="relative">
        {/* Cover Image / Gradient Background */}
        <div className="h-48 md:h-64 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700">
          {profile.gallery_images && profile.gallery_images.length > 0 && (
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30"
              style={{ backgroundImage: `url(${profile.gallery_images[0]})` }}
            />
          )}
        </div>

        {/* Profile Info Card */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-24 md:-mt-32">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Profile Photo */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    {profilePhotoUrl ? (
                      <img
                        src={profilePhotoUrl}
                        alt={profile.full_name || "Profile"}
                        className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover border-4 border-white dark:border-slate-800 shadow-lg"
                      />
                    ) : (
                      <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-lg">
                        <span className="text-4xl md:text-5xl font-bold text-emerald-600">
                          {profile.full_name?.charAt(0) || "?"}
                        </span>
                      </div>
                    )}
                    {isProfileComplete && (
                      <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-full shadow-lg">
                        <CheckCircle2 size={20} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile Details */}
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                        {profile.full_name || "Your Name"}
                      </h1>
                      <p className="text-lg text-slate-600 dark:text-slate-300 mt-1">
                        {profile.headline || "Fitness Instructor"}
                      </p>
                      {profile.location && (
                        <div className="flex items-center gap-2 mt-2 text-slate-500">
                          <MapPin size={16} />
                          <span>{profile.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => router.push("/profile-setup/instructor")}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                      >
                        <Edit2 size={16} />
                        Edit Profile
                      </button>
                      <button className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <Share2 size={20} className="text-slate-600 dark:text-slate-400" />
                      </button>
                      <button className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <Settings size={20} className="text-slate-600 dark:text-slate-400" />
                      </button>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Star className="text-amber-500" size={20} />
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {profile.rating?.toFixed(1) || "N/A"}
                      </span>
                      <span className="text-slate-500">Rating</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="text-blue-500" size={20} />
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {profile.review_count || 0}
                      </span>
                      <span className="text-slate-500">Reviews</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="text-purple-500" size={20} />
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {profile.view_count || 0}
                      </span>
                      <span className="text-slate-500">Views</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="text-emerald-500" size={20} />
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {profile.years_of_experience || profile.experience_years || 0}
                      </span>
                      <span className="text-slate-500">Years Experience</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">About</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {profile.bio || "No bio added yet. Edit your profile to add a bio."}
              </p>
            </div>

            {/* Fitness Styles */}
            {profile.fitness_styles && profile.fitness_styles.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Dumbbell className="text-emerald-500" size={20} />
                  Fitness Styles
                </h2>
                <div className="flex flex-wrap gap-2">
                  {profile.fitness_styles.map((style, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-sm font-medium"
                    >
                      {style}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {profile.experience && profile.experience.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Briefcase className="text-emerald-500" size={20} />
                  Work Experience
                </h2>
                <div className="space-y-4">
                  {profile.experience.map((exp, index) => (
                    <div
                      key={index}
                      className={`relative pl-6 ${
                        index < profile.experience!.length - 1
                          ? "pb-4 border-l-2 border-slate-200 dark:border-slate-700"
                          : ""
                      }`}
                    >
                      <div className="absolute left-[-5px] top-1 w-3 h-3 rounded-full bg-emerald-500" />
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {exp.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">{exp.company}</p>
                      <p className="text-sm text-slate-500">{exp.period}</p>
                      {exp.isActive && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery */}
            {profile.gallery_images && profile.gallery_images.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {profile.gallery_images.map((img, index) => (
                    <div
                      key={index}
                      className="aspect-square rounded-xl overflow-hidden"
                    >
                      <img
                        src={getOptimizedCloudinaryUrl(img, { width: 400, height: 400 })}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Contact Information</h2>
              <div className="space-y-3">
                {profile.email && (
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                    <Mail size={18} className="text-emerald-500" />
                    <span className="text-sm">{profile.email}</span>
                  </div>
                )}
                {profile.contact_number && (
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                    <Phone size={18} className="text-emerald-500" />
                    <span className="text-sm">{profile.contact_number}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Certifications */}
            {profile.certifications && profile.certifications.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Award className="text-emerald-500" size={18} />
                  Certifications
                </h2>
                <div className="space-y-2">
                  {profile.certifications.map((cert, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
                    >
                      <CheckCircle2 size={16} className="text-emerald-500" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Availability */}
            {profile.availability_slots && profile.availability_slots.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Clock className="text-emerald-500" size={18} />
                  Availability
                </h2>
                <div className="flex flex-wrap gap-2">
                  {profile.availability_slots.map((slot, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-medium"
                    >
                      {slot}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Hourly Rate */}
            {profile.hourly_rate && (
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 shadow-sm text-white">
                <h2 className="text-lg font-bold mb-2">Hourly Rate</h2>
                <p className="text-3xl font-bold">${profile.hourly_rate}</p>
                <p className="text-emerald-100 text-sm mt-1">per hour</p>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <button
                  onClick={() => router.push("/dashboard/instructor")}
                  className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Go to Dashboard</span>
                  <ChevronRight size={18} className="text-slate-400" />
                </button>
                <button
                  onClick={() => router.push("/jobs")}
                  className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Browse Jobs</span>
                  <ChevronRight size={18} className="text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
