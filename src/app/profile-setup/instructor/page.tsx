"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, Shield, Check, Loader } from "lucide-react";
import { Profile } from "@/types";
import BasicsSection from "./_components/BasicsSection";
import ExperienceSection from "./_components/ExperienceSection";
import CertificationsSection from "./_components/CertificationsSection";
import AvailabilitySection from "./_components/AvailabilitySection";
import MediaSection from "./_components/MediaSection";
import ProfilePreviewModal from "./_components/ProfilePreviewModal";
import { saveProfileDraft, submitProfile, getInstructorProfile } from "@/services/instructorProfileService";
import { useStore } from "@/store/zustand";
import { useAuth } from "@/store/firebase-auth-provider";

type FormStep = "basics" | "experience" | "certs" | "availability" | "media";

const sections: { id: FormStep; label: string; number: number }[] = [
  { id: "basics", label: "The Basics", number: 1 },
  { id: "experience", label: "Work Experience", number: 2 },
  { id: "certs", label: "Certifications", number: 3 },
  { id: "availability", label: "Availability", number: 4 },
  { id: "media", label: "Media", number: 5 },
];

export default function InstructorProfileSetup() {
  const [activeSection, setActiveSection] = useState<FormStep>("basics");
  const [completionPercentage, setCompletionPercentage] = useState(20);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useStore();
  const { user: firebaseUser, profile: authProfile } = useAuth();
  
  const [profile, setProfile] = useState<Partial<Profile>>({
    user_type: "instructor",
    full_name: "",
    email: "",
  });
  
  const sectionRefs = useRef<Record<FormStep, HTMLElement | null>>({
    basics: null,
    experience: null,
    certs: null,
    availability: null,
    media: null,
  });

  // Load existing profile data on mount
  useEffect(() => {
    const loadExistingProfile = async () => {
      const userId = firebaseUser?.uid || (user as any)?.uid || (user as any)?.id;
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        const existingProfile = await getInstructorProfile(userId);
        if (existingProfile) {
          // Merge existing profile data
          setProfile({
            ...existingProfile,
            // Ensure email from auth is used
            email: firebaseUser?.email || authProfile?.email || existingProfile.email,
          });
          updateCompletionPercentage(existingProfile);
          console.log("Loaded existing profile:", existingProfile);
        } else {
          // Set defaults from auth
          setProfile({
            user_type: "instructor",
            full_name: firebaseUser?.displayName || authProfile?.full_name || "",
            email: firebaseUser?.email || authProfile?.email || "",
          });
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        // Set defaults on error
        setProfile({
          user_type: "instructor",
          full_name: firebaseUser?.displayName || "",
          email: firebaseUser?.email || "",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingProfile();
  }, [firebaseUser, authProfile, user]);

  // Scroll spy to detect active section
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;
      
      for (const section of sections) {
        const element = sectionRefs.current[section.id];
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleProfileChange = (updates: Partial<Profile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
    updateCompletionPercentage({ ...profile, ...updates });
  };

  const updateCompletionPercentage = (currentProfile: Partial<Profile>) => {
    let completed = 0;
    const total = 8; // 8 key areas

    // Basics (headline, name, location, bio - 20%)
    if (currentProfile.full_name && currentProfile.headline && currentProfile.location && (currentProfile.bio?.length || 0) >= 60) {
      completed++;
    }
    
    // Certifications (10%)
    if (currentProfile.certifications && currentProfile.certifications.length > 0) {
      completed++;
    }
    
    // Fitness styles (10%)
    if (currentProfile.fitness_styles && currentProfile.fitness_styles.length > 0) {
      completed++;
    }
    
    // Experience (20%)
    if (currentProfile.experience && currentProfile.experience.length > 0) {
      completed++;
    }
    
    // Certification details (10%)
    if (currentProfile.certification_details && currentProfile.certification_details.length > 0) {
      completed++;
    }
    
    // Availability (15%)
    if (currentProfile.availability_slots && currentProfile.availability_slots.length > 0) {
      completed++;
    }
    
    // Profile photo (10%)
    if (currentProfile.profile_photo) {
      completed++;
    }
    
    // Gallery images (5%)
    if (currentProfile.gallery_images && currentProfile.gallery_images.length > 0) {
      completed++;
    }

    setCompletionPercentage(Math.round((completed / total) * 100));
  };

  const scrollToSection = (sectionId: FormStep) => {
    const element = sectionRefs.current[sectionId];
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: "smooth",
      });
    }
  };

  const handleSaveDraft = async () => {
    const userId = firebaseUser?.uid || (user as any)?.uid || (user as any)?.id;
    if (!userId) {
      alert("Please log in first");
      return;
    }

    setIsSaving(true);
    try {
      // Show uploading message if there are images
      if (profile.profile_photo || (profile.gallery_images && profile.gallery_images.length > 0)) {
        console.log("Uploading images...");
      }
      
      // Ensure email is from auth
      const profileToSave = {
        ...profile,
        email: firebaseUser?.email || profile.email,
      };
      
      await saveProfileDraft(userId, profileToSave);
      alert("✓ Profile saved as draft successfully!");
      console.log("Draft saved:", profileToSave);
    } catch (error) {
      console.error("Error saving draft:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save draft";
      alert(`Failed to save draft: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreviewProfile = () => {
    console.log("Opening preview:", profile);
    setIsPreviewOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Handle submit called");
    const userId = firebaseUser?.uid || (user as any)?.uid || (user as any)?.id;
    console.log("Submitting profile for userId:", userId, profile);
    if (!userId) {
      alert("Please log in first");
      return;
    }

    setIsSaving(true);
    try {
      // Validation
      if (!profile.full_name || !profile.headline) {
        alert("Please complete the basics section (name and headline required).");
        setIsSaving(false);
        return;
      }
      if (!profile.experience || profile.experience.length === 0) {
        alert("Please add at least one work experience.");
        setIsSaving(false);
        return;
      }
      if (!profile.availability_slots || profile.availability_slots.length === 0) {
        alert("Please set your availability.");
        setIsSaving(false);
        return;
      }

      // Show uploading message if there are images
      if (profile.profile_photo || (profile.gallery_images && profile.gallery_images.length > 0)) {
        console.log("Uploading images before submission...");
      }

      // Ensure email is from auth
      const profileToSubmit = {
        ...profile,
        email: firebaseUser?.email || profile.email,
      };

      await submitProfile(userId, profileToSubmit);
      alert("✓ Profile submitted successfully! We will review it shortly.");
      console.log("Profile submitted:", profileToSubmit);
      
      // Redirect to dashboard instead of resetting
      window.location.href = "/dashboard/instructor";
    } catch (error) {
      console.error("Error submitting profile:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to submit profile";
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const getCompletedSections = () => {
    const completed: FormStep[] = [];
    
    // Basics - more comprehensive check
    if (
      profile.full_name && 
      profile.headline && 
      profile.location && 
      (profile.bio?.length || 0) >= 60 &&
      profile.certifications &&
      profile.certifications.length > 0 &&
      profile.fitness_styles &&
      profile.fitness_styles.length > 0
    ) {
      completed.push("basics");
    }
    
    if (profile.experience && profile.experience.length > 0) {
      completed.push("experience");
    }
    
    if (profile.certification_details && profile.certification_details.length > 0) {
      completed.push("certs");
    }
    
    if (profile.availability_slots && profile.availability_slots.length > 0) {
      completed.push("availability");
    }
    
    if (profile.profile_photo || (profile.gallery_images && profile.gallery_images.length > 0)) {
      completed.push("media");
    }
    
    return completed;
  };

  const completedSections = getCompletedSections();

  // Show loading state while fetching existing profile
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-10 h-10 text-emerald-500 animate-spin" />
          <p className="text-slate-500">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-slate-950">
      <div className="flex">
        {/* Sidebar Navigation - Fixed */}
        <aside className="hidden lg:flex w-72 flex-col fixed left-0 top-[72px] bottom-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6 overflow-y-auto z-20">
          <div className="mb-8">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Profile Builder</h1>
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm text-slate-500">{completionPercentage}% Complete</p>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">Draft</span>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500 ease-out"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          <nav className="flex flex-col gap-1">
            {sections.map((section) => {
              const isActive = activeSection === section.id;
              const isCompleted = completedSections.includes(section.id);
              
              return (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border-l-4 border-transparent'
                  }`}
                >
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-emerald-500 text-white'
                      : isActive
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                      : 'border-2 border-gray-300 dark:border-gray-600 text-gray-400'
                  }`}>
                    {isCompleted ? <Check size={14} strokeWidth={3} /> : section.number}
                  </div>
                  <span className={`text-sm font-medium transition-colors ${
                    isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'
                  }`}>
                    {section.label}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="mt-auto pt-6">
            <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-4 border border-emerald-100 dark:border-emerald-800/30">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                  <Shield size={18} className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Get Verified</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">Upload your certs to get the verified badge and boost visibility.</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-72 min-h-screen">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 py-8 lg:py-12">
            <div className="mb-10">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                Complete Your Profile
              </h1>
              <p className="text-base sm:text-lg text-slate-500 mt-2">
                Studios are looking for talent like you. Let&apos;s make your profile stand out.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-16 pb-32">
              {/* All sections rendered */}
              <div ref={(el) => { sectionRefs.current.basics = el; }}>
                <BasicsSection profile={profile} onChange={handleProfileChange} />
              </div>
              
              <div ref={(el) => { sectionRefs.current.experience = el; }}>
                <ExperienceSection profile={profile} onChange={handleProfileChange} />
              </div>
              
              <div ref={(el) => { sectionRefs.current.certs = el; }}>
                <CertificationsSection profile={profile} onChange={handleProfileChange} />
              </div>
              
              <div ref={(el) => { sectionRefs.current.availability = el; }}>
                <AvailabilitySection profile={profile} onChange={handleProfileChange} />
              </div>
              
              <div ref={(el) => { sectionRefs.current.media = el; }}>
                <MediaSection profile={profile} onChange={handleProfileChange} />
              </div>
            </form>
          </div>

        {/* Sticky Submit Bar */}
        <div className="fixed bottom-0 left-0 lg:left-72 right-0 z-30 border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 py-4 flex items-center justify-between">
            <button
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="text-sm font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors active:scale-95 disabled:opacity-50 flex items-center gap-2"
              type="button"
            >
              {isSaving ? <Loader size={14} className="animate-spin" /> : null}
              {isSaving ? "Saving..." : "Save as Draft"}
            </button>
            <div className="flex gap-3">
              <button
                onClick={handlePreviewProfile}
                disabled={isSaving}
                className="hidden sm:block rounded-lg px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors active:scale-95 disabled:opacity-50"
                type="button"
              >
                Preview Profile
              </button>
              <button
                className="flex items-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all active:scale-95 disabled:opacity-70"
                type="submit"
                onClick={handleSubmit}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <ArrowRight size={16} />
                    Submit Profile
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Profile Preview Modal */}
        <ProfilePreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          profile={profile}
        />
        </main>
      </div>
    </div>
  );
}
