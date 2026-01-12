"use client";

import {
  Share2,
  MapPin,
  CheckCircle,
  Star,
  Calendar,
  Award,
  Mail,
  Phone,
  Briefcase,
  Globe,
  Shield,
  Clock,
  MessageCircle,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StatCard } from "./stat-card";
import { AvailabilityGrid } from "./availability-grid";
import { ExperienceTimeline } from "./experience-timeline";
import { CertificationCard } from "./certification-card";
import { Profile } from "@/types";
import { getOptimizedCloudinaryUrl } from "@/lib/cloudinary";
import InviteModal from "../../_components/InviteModal";
import { useAuth } from "@/store/firebase-auth-provider";
import { getOrCreateConversation } from "@/services/chatService";
import { toast } from "sonner";

interface InstructorProfileProps {
  instructor: Profile;
}

export function InstructorProfile({ instructor }: InstructorProfileProps) {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const router = useRouter();
  const { user, profile: currentUserProfile } = useAuth();
  const [isMessageLoading, setIsMessageLoading] = useState(false);

  // Get status badge info
  const getStatusBadge = () => {
    const status = (instructor as any).status;
    if (status === "verified") {
      return { label: "Verified", color: "bg-emerald-500", icon: Shield };
    } else if (status === "submitted") {
      return { label: "Pending Review", color: "bg-yellow-500", icon: Clock };
    } else {
      return { label: "Draft", color: "bg-slate-400", icon: Clock };
    }
  };

  const statusBadge = getStatusBadge();
  const StatusIcon = statusBadge.icon;

  // Optimize profile image
  const profilePhotoUrl = instructor.profile_photo
    ? getOptimizedCloudinaryUrl(instructor.profile_photo, { width: 400, height: 400 })
    : null;

  // Calculate years of experience from experience array
  const calculateExperienceYears = () => {
    if (instructor.years_of_experience) return instructor.years_of_experience;
    if (instructor.experience_years) return instructor.experience_years;
    if (instructor.experience && instructor.experience.length > 0) {
      return instructor.experience.length * 2;
    }
    return 0;
  };

  const handleMessage = async () => {
    if (!user) {
      toast.error("Please sign in to message this instructor");
      return;
    }
    
    // Determine user types
    const currentUserType = currentUserProfile?.user_type || "studio";
    
    try {
      setIsMessageLoading(true);
      await getOrCreateConversation(
        user.uid,
        instructor.id,
        { 
          name: currentUserProfile?.name || currentUserProfile?.full_name || "User",
          avatar: currentUserProfile?.images?.[0] || currentUserProfile?.profile_photo,
          userType: currentUserType as "studio" | "instructor"
        },
        { 
          name: instructor.full_name || "Instructor",
          avatar: instructor.profile_photo || instructor.images?.[0],
          userType: "instructor"
        }
      );
      
      router.push("/chat");
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast.error("Failed to start conversation");
    } finally {
      setIsMessageLoading(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <InviteModal 
        isOpen={isInviteModalOpen} 
        onClose={() => setIsInviteModalOpen(false)} 
        instructor={instructor} 
      />
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-8">
        <a
          href="/"
          className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          Home
        </a>
        <span className="text-slate-400">/</span>
        <a
          href="/instructors"
          className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          Instructors
        </a>
        <span className="text-slate-400">/</span>
        <span className="text-slate-900 dark:text-white font-medium">
          {instructor.full_name}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="relative shrink-0">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 overflow-hidden shadow-md">
                {profilePhotoUrl ? (
                  <img
                    src={profilePhotoUrl}
                    alt={instructor.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-slate-400">
                    {instructor.full_name?.charAt(0) || "?"}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-900 p-1 rounded-full">
                <div className={`${statusBadge.color} text-white rounded-full p-2 shadow-md`}>
                  <StatusIcon className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
                      {instructor.full_name}
                    </h1>
                    {/* Status Badge */}
                    <span className={`px-3 py-1 ${statusBadge.color} text-white text-xs font-semibold rounded-full`}>
                      {statusBadge.label}
                    </span>
                    {/* Open to Work Badge */}
                    {instructor.open_to_work && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-semibold rounded-full">
                        Open to Work
                      </span>
                    )}
                  </div>
                  
                  {/* Headline */}
                  {instructor.headline && (
                    <p className="text-lg text-slate-600 dark:text-slate-300 mb-3">
                      {instructor.headline}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400 mb-4">
                    {instructor.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{instructor.location}</span>
                        {instructor.postal_code && (
                          <span className="text-slate-400">({instructor.postal_code})</span>
                        )}
                      </div>
                    )}
                    {instructor.travel_preference && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        <span>Will travel: {instructor.travel_preference}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-green-600 font-medium">
                        ● Replies within 1h
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full md:w-auto gap-2 bg-transparent"
                >
                  <Share2 className="w-4 h-4" />
                  Share Profile
                </Button>
              </div>

              {/* Fitness Styles / Specialties */}
              {instructor.fitness_styles && instructor.fitness_styles.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {instructor.fitness_styles.map((style) => (
                    <span
                      key={style}
                      className="px-3 py-1.5 bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 rounded-lg text-xs font-bold text-blue-700 dark:text-slate-300 uppercase tracking-wide"
                    >
                      {style}
                    </span>
                  ))}
                </div>
              )}

              {/* Bio */}
              {instructor.bio && (
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base max-w-2xl">
                  {instructor.bio}
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Experience"
              value={`${calculateExperienceYears()} Years`}
            />
            <StatCard
              label="Classes Taught"
              value={`${instructor.classes_taught || 0}+`}
            />
            <StatCard
              label="Review Score"
              value={instructor.rating?.toString() || "N/A"}
              icon={
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              }
            />
            <StatCard
              label="Profile Views"
              value={`${instructor.view_count || 0}`}
            />
          </div>

          {/* Certifications Badges (Quick Overview) */}
          {instructor.certifications && instructor.certifications.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-green-500" />
                Certified In
              </h2>
              <div className="flex flex-wrap gap-2">
                {instructor.certifications.map((cert) => (
                  <span
                    key={cert}
                    className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-sm font-medium text-emerald-700 dark:text-emerald-300"
                  >
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Availability */}
          {instructor.availability_slots && instructor.availability_slots.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-500" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Weekly Availability
                </h2>
              </div>
              <AvailabilityGrid
                availabilitySlots={instructor.availability_slots}
              />
            </div>
          )}

          {/* Experience & Certifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {instructor.experience && instructor.experience.length > 0 && (
              <ExperienceTimeline experiences={instructor.experience} />
            )}
            
            {instructor.certification_details && instructor.certification_details.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-green-500" />
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Certification Details
                  </h2>
                </div>
                <div className="space-y-3">
                  {instructor.certification_details.map((cert, idx) => (
                    <CertificationCard
                      key={idx}
                      title={cert.title}
                      issued={cert.issued}
                      icon={cert.icon}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Gallery */}
          {instructor.gallery_images && instructor.gallery_images.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Gallery
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-64 md:h-96">
                {instructor.gallery_images.slice(0, 4).map((image, idx) => (
                  <div
                    key={idx}
                    className={`rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow ${
                      idx === 0 ? "col-span-2 row-span-2" : ""
                    }`}
                  >
                    <img
                      src={getOptimizedCloudinaryUrl(image, { width: 600 })}
                      alt={`Gallery ${idx + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Contact & Hire Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm sticky top-24">
            <div className="">
              <div className="flex justify-between items-center mb-6 border-b pb-3">
                <div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Standard Rate</h3>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                    ${instructor.hourly_rate || instructor.class_rate || 75}{" "}
                    <span className="text-sm text-gray-500">/ class</span>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center gap-1">
                  <div className="flex gap-2 items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {instructor.rating || "New"}
                    </span>
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {instructor.review_count || 0} Reviews
                  </span>
                </div>
              </div>

              <Button 
                onClick={() => setIsInviteModalOpen(true)}
                className="w-full bg-green-500 hover:bg-green-600 text-white mb-3"
              >
                Invite to Gig
              </Button>
              <button 
                onClick={handleMessage}
                disabled={isMessageLoading}
                className="w-full text-sm font-semibold text-slate-900 dark:text-white py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                {isMessageLoading ? "Loading..." : `Message ${instructor.full_name?.split(" ")[0]}`}
              </button>
              
              {(instructor as any).status === "verified" && (
                <div className="flex items-center justify-center gap-2 text-green-600 text-sm font-medium mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <CheckCircle className="w-4 h-4" />
                  Identity Verified
                </div>
              )}
            </div>

            {/* Contact Information */}
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Contact Information</h3>
              
              {instructor.email && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                    <Mail className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
                    <p className="text-slate-900 dark:text-white">{instructor.email}</p>
                  </div>
                </div>
              )}
              
              {instructor.contact_number && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                    <Phone className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Phone</p>
                    <p className="text-slate-900 dark:text-white">{instructor.contact_number}</p>
                  </div>
                </div>
              )}
              
              {instructor.location && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Location</p>
                    <p className="text-slate-900 dark:text-white">
                      {instructor.location}
                      {instructor.postal_code && `, ${instructor.postal_code}`}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Why Great Fit */}
            <div className="mt-8 space-y-4 border p-6 rounded-xl bg-[#f4f8fe] dark:bg-slate-800/50">
              <h3 className="font-bold text-slate-900 dark:text-white">
                Why {instructor.full_name?.split(" ")[0]} is a great fit
              </h3>
              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex gap-2">
                  <span className="text-green-500 mt-0.5">⚡</span>
                  <span>
                    High energy teaching style matches your studio vibe.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-500 mt-0.5">🎯</span>
                  <span>
                    Specialized in{" "}
                    {instructor.fitness_styles?.[0] || "fitness"}{" "}
                    disciplines.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-500 mt-0.5">📅</span>
                  <span>Available for your requested time slots.</span>
                </li>
                {instructor.travel_preference && (
                  <li className="flex gap-2">
                    <span className="text-green-500 mt-0.5">🚗</span>
                    <span>Willing to travel {instructor.travel_preference}.</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
