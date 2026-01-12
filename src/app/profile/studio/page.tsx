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
  Globe,
  Instagram,
  Facebook,
  Check,
  Building
} from "lucide-react";
import { useAuth } from "@/store/firebase-auth-provider";
import { getStudioById } from "@/services/studioService";
import type { Profile } from "@/types";
import { getOptimizedCloudinaryUrl } from "@/lib/cloudinary";
import { toast } from "sonner";

export default function StudioProfilePage() {
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
        const studioProfile = await getStudioById(user.uid);
        
        if (!studioProfile) {
          // No profile exists, redirect to setup
          router.push("/profile-setup/studio");
          return;
        }

        console.log("Fetched studio profile:", studioProfile);
        setProfile(studioProfile);
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
            onClick={() => router.push("/profile-setup/studio")}
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
    
  // Use first image from images array as cover if no specific cover field exists
  const coverImageUrl = profile.images && profile.images.length > 0 
    ? getOptimizedCloudinaryUrl(profile.images[0], { width: 1200, height: 400 })
    : null;

  const isProfileComplete = profile.profile_completed;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Profile Header */}
      <div className="relative">
        {/* Cover Image / Gradient Background */}
        <div className="h-48 md:h-64 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700">
          {coverImageUrl && (
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
              style={{ backgroundImage: `url(${coverImageUrl})` }}
            />
          )}
        </div>

        {/* Profile Info Card */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-24 md:-mt-32">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Profile Photo (Logo) */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    {profilePhotoUrl ? (
                      <img
                        src={profilePhotoUrl}
                        alt={profile.name || "Studio Logo"}
                        className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover border-4 border-white dark:border-slate-800 shadow-lg"
                      />
                    ) : (
                      <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-lg">
                        <Building size={48} className="text-emerald-500" />
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
                        {profile.name || "Studio Name"}
                      </h1>
                      <p className="text-lg text-slate-600 dark:text-slate-300 mt-1">
                        {profile.tagline || (profile.user_type === 'studio' ? "Fitness Studio" : "Fitness Professional")}
                      </p>
                      {profile.location && (
                        <div className="flex items-center gap-2 mt-2 text-slate-500">
                          <MapPin size={16} />
                          <span>{profile.location}</span>
                        </div>
                      )}
                      
                      {/* Social Links */}
                      <div className="flex gap-4 mt-4">
                        {profile.website && (
                          <a href={profile.website} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-emerald-500 transition-colors">
                            <Globe size={20} />
                          </a>
                        )}
                        {profile.instagram && (
                          <a href={`https://instagram.com/${profile.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-pink-500 transition-colors">
                            <Instagram size={20} />
                          </a>
                        )}
                        {profile.facebook && (
                          <a href={profile.facebook} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-600 transition-colors">
                            <Facebook size={20} />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => router.push("/profile-setup/studio")}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                      >
                        <Edit2 size={16} />
                        Edit Profile
                      </button>
                      <button 
                        onClick={() => {
                          const url = `${window.location.origin}/studios/${profile.id}`;
                          navigator.clipboard.writeText(url);
                          toast.success("Profile link copied to clipboard");
                        }}
                        className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Share2 size={20} className="text-slate-600 dark:text-slate-400" />
                      </button>
                      {/* <button className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <Settings size={20} className="text-slate-600 dark:text-slate-400" />
                      </button> */}
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
                    {/* Add any other relevant stats for studios */}
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
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">About the Studio</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {profile.description || "No description added yet. Edit your profile to tell instructors about your studio."}
              </p>
            </div>

            {/* Studio Styles */}
            {profile.styles && profile.styles.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Dumbbell className="text-emerald-500" size={20} />
                  Studio Styles
                </h2>
                <div className="flex flex-wrap gap-2">
                  {profile.styles.map((style, index) => (
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

            {/* Amenities */}
             {profile.amenities && profile.amenities.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <CheckCircle2 className="text-emerald-500" size={20} />
                  Amenities
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {profile.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500">
                             <Check size={12} />
                        </div>
                        <span className="text-slate-700 dark:text-slate-300">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}


            {/* Gallery */}
            {profile.images && profile.images.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {profile.images.map((img, index) => (
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
                {profile.phone_number && (
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                    <Phone size={18} className="text-emerald-500" />
                    <span className="text-sm">{profile.phone_number}</span>
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                    <Globe size={18} className="text-emerald-500" />
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline hover:text-emerald-500 truncate">{profile.website}</a>
                  </div>
                )}
              </div>
            </div>

            {/* Hiring Types */}
            {profile.hiring_types && profile.hiring_types.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Briefcase className="text-emerald-500" size={18} />
                  Looking For
                </h2>
                <div className="space-y-2">
                  {profile.hiring_types.map((type, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
                    >
                      <CheckCircle2 size={16} className="text-emerald-500" />
                      <span className="text-sm text-slate-700 dark:text-slate-300 capitalize">{type.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}


            {/* Quick Actions */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <button
                  onClick={() => router.push("/dashboard/studio")}
                  className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Go to Dashboard</span>
                  <ChevronRight size={18} className="text-slate-400" />
                </button>
                <button
                  onClick={() => router.push("/instructors")}
                  className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Find Instructors</span>
                  <ChevronRight size={18} className="text-slate-400" />
                </button>
                 <button
                  onClick={() => router.push("/jobs/post")}
                  className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Post a Job</span>
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
