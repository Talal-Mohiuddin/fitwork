"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowRight,
  Loader2,
  Check,
  Shield,
} from "lucide-react";
import { Profile } from "@/types";
import { useAuth } from "@/store/firebase-auth-provider";
import { saveStudioProfile } from "@/services/studioService";
import IdentitySection from "./_components/IdentitySection";
import ContactSection from "./_components/ContactSection";
import OfferingsSection from "./_components/OfferingsSection";
import InstructorExpectationsSection from "./_components/InstructorExpectationsSection";
import CompensationSection from "./_components/CompensationSection";
import GallerySection from "./_components/GallerySection";

type FormStep =
  | "identity"
  | "contact"
  | "offerings"
  | "expectations"
  | "compensation"
  | "gallery";

const sections: { id: FormStep; label: string; number: number }[] = [
  { id: "identity", label: "Identity", number: 1 },
  { id: "contact", label: "Contact & Location", number: 2 },
  { id: "offerings", label: "Class Styles", number: 3 },
  { id: "expectations", label: "Instructor Exp.", number: 4 },
  { id: "compensation", label: "Compensation", number: 5 },
  { id: "gallery", label: "Gallery", number: 6 },
];

export default function StudioProfileSetup() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<FormStep>("identity");
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [studioProfile, setStudioProfile] = useState<Partial<Profile>>({
    user_type: "studio",
  });

  const sectionRefs = useRef<Record<FormStep, HTMLElement | null>>({
    identity: null,
    contact: null,
    offerings: null,
    expectations: null,
    compensation: null,
    gallery: null,
  });

  // Initial completion calculation on mount
  useEffect(() => {
    updateCompletionPercentage(studioProfile);
  }, [studioProfile]);

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
    const updatedProfile = { ...studioProfile, ...updates };
    setStudioProfile(updatedProfile);
    updateCompletionPercentage(updatedProfile);
  };

  const updateCompletionPercentage = (currentProfile: Partial<Profile>) => {
    let completed = 0;
    const total = 10; // 10 key areas

    // Identity - name (10%)
    if (currentProfile.name?.trim()) {
      completed++;
    }

    // Identity - bio/description (10%)
    if (currentProfile.bio && currentProfile.bio.length >= 60) {
      completed++;
    }

    // Contact - location (10%)
    if (currentProfile.location?.trim()) {
      completed++;
    }

    // Contact - website (10%)
    if (currentProfile.website?.trim()) {
      completed++;
    }

    // Offerings - class styles (10%)
    if (currentProfile.styles && currentProfile.styles.length > 0) {
      completed++;
    }

    // Offerings - amenities (10%)
    if (currentProfile.amenities && currentProfile.amenities.length > 0) {
      completed++;
    }

    // Expectations - experience level (10%)
    if (currentProfile.experience_level) {
      completed++;
    }

    // Compensation - payment type (10%)
    if (currentProfile.pay_structure) {
      completed++;
    }

    // Gallery - profile image (10%)
    if (currentProfile.profile_photo) {
      completed++;
    }

    // Gallery - additional images (10%)
    if (currentProfile.images && currentProfile.images.length > 0) {
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

  const getCompletedSections = () => {
    const completed: FormStep[] = [];

    // Identity - comprehensive check
    if (studioProfile.name?.trim() && studioProfile.bio && studioProfile.bio.length >= 60) {
      completed.push("identity");
    }

    // Contact - location and website
    if (studioProfile.location?.trim() && studioProfile.website?.trim()) {
      completed.push("contact");
    }

    // Offerings - styles and amenities
    if (studioProfile.styles && studioProfile.styles.length > 0) {
      completed.push("offerings");
    }

    // Expectations
    if (studioProfile.experience_level) {
      completed.push("expectations");
    }

    // Compensation
    if (studioProfile.pay_structure) {
      completed.push("compensation");
    }

    // Gallery - images
    if (studioProfile.profile_photo || (studioProfile.images && studioProfile.images.length > 0)) {
      completed.push("gallery");
    }

    return completed;
  };

  const validateProfile = (): { valid: boolean; message?: string; missingFields: string[] } => {
    const missingFields: string[] = [];

    if (!studioProfile.name?.trim()) {
      missingFields.push("Studio name");
    }
    if (!studioProfile.bio || studioProfile.bio.length < 60) {
      missingFields.push("Studio bio (minimum 60 characters)");
    }
    if (!studioProfile.location?.trim()) {
      missingFields.push("Location");
    }
    if (!studioProfile.website?.trim()) {
      missingFields.push("Website URL");
    }
    if (!studioProfile.styles || studioProfile.styles.length === 0) {
      missingFields.push("At least one class style");
    }
    if (!studioProfile.amenities || studioProfile.amenities.length === 0) {
      missingFields.push("Studio amenities");
    }
    if (!studioProfile.experience_level) {
      missingFields.push("Preferred instructor experience level");
    }
    if (!studioProfile.pay_structure) {
      missingFields.push("Compensation structure");
    }
    if (!studioProfile.profile_photo && (!studioProfile.images || studioProfile.images.length === 0)) {
      missingFields.push("At least one studio image");
    }

    if (missingFields.length > 0) {
      const message = `Missing required fields: ${missingFields.join(", ")}. Please complete all sections before publishing.`;
      toast.error(message, { duration: 5000 });

      // Scroll to first missing section
      if (!studioProfile.name?.trim() || (studioProfile.bio && studioProfile.bio.length < 60)) {
        scrollToSection("identity");
      } else if (!studioProfile.location?.trim() || !studioProfile.website?.trim()) {
        scrollToSection("contact");
      } else if (!studioProfile.styles || studioProfile.styles.length === 0 || !studioProfile.amenities || studioProfile.amenities.length === 0) {
        scrollToSection("offerings");
      } else if (!studioProfile.experience_level) {
        scrollToSection("expectations");
      } else if (!studioProfile.pay_structure) {
        scrollToSection("compensation");
      } else {
        scrollToSection("gallery");
      }

      return { valid: false, message, missingFields };
    }

    return { valid: true, missingFields: [] };
  };

  const handleSaveDraft = async () => {
    if (!user) {
      toast.error("Please log in to save your profile");
      return;
    }

    setIsSubmitting(true);
    try {
      await saveStudioProfile(user.uid, studioProfile, true);
      toast.success("Profile draft saved successfully");
    } catch (error) {
      console.error("Error saving draft:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save draft";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!user) {
      toast.error("Please log in to publish your profile");
      return;
    }

    const validation = validateProfile();
    if (!validation.valid) {
      // Error message already shown in validateProfile with toast
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("Publishing studio profile:", studioProfile);
      await saveStudioProfile(user.uid, studioProfile, false);
      toast.success("Profile published successfully!");
      router.push("/dashboard/studio");
    } catch (error) {
      console.error("Error publishing profile:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to publish profile. Please try again.";
      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  const completedSections = getCompletedSections();

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-slate-950">
      <div className="flex">
        {/* Sidebar Navigation - Fixed */}
        <aside className="hidden lg:flex w-72 flex-col fixed left-0 top-18 bottom-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6 overflow-y-auto z-20">
          <div className="mb-8">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Studio Profile</h1>
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm text-slate-500">{completionPercentage}% Complete</p>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">Draft</span>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-linear-to-r from-emerald-500 to-emerald-400 transition-all duration-500 ease-out"
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
                  className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-200 ${isActive
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border-l-4 border-transparent'
                    }`}
                >
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold transition-all ${isCompleted
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : isActive
                        ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                        : 'border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-500'
                    }`}>
                    {isCompleted ? <Check size={14} strokeWidth={3} /> : section.number}
                  </div>
                  <span className={`text-sm font-medium transition-colors ${isActive
                      ? 'text-slate-900 dark:text-white'
                      : 'text-slate-600 dark:text-slate-400'
                    }`}>
                    {section.label}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="mt-auto pt-6">
            <div className="rounded-xl bg-linear-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-4 border border-emerald-100 dark:border-emerald-800/30">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                  <Shield size={18} className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white mb-1">Your data is secure</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">All information is encrypted and stored safely.</p>
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
                Create Your Studio Profile
              </h1>
              <p className="text-base sm:text-lg text-slate-500 mt-2">
                Build your talent OS. Attract the best instructors with transparency and operational clarity.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-16 pb-32">
              {/* All sections rendered */}
              <div ref={(el) => { sectionRefs.current.identity = el; }}>
                <IdentitySection
                  profile={studioProfile}
                  onChange={handleProfileChange}
                />
              </div>

              <div ref={(el) => { sectionRefs.current.contact = el; }}>
                <ContactSection
                  profile={studioProfile}
                  onChange={handleProfileChange}
                />
              </div>

              <div ref={(el) => { sectionRefs.current.offerings = el; }}>
                <OfferingsSection
                  profile={studioProfile}
                  onChange={handleProfileChange}
                />
              </div>

              <div ref={(el) => { sectionRefs.current.expectations = el; }}>
                <InstructorExpectationsSection
                  profile={studioProfile}
                  onChange={handleProfileChange}
                />
              </div>

              <div ref={(el) => { sectionRefs.current.compensation = el; }}>
                <CompensationSection
                  profile={studioProfile}
                  onChange={handleProfileChange}
                />
              </div>

              <div ref={(el) => { sectionRefs.current.gallery = el; }}>
                <GallerySection
                  profile={studioProfile}
                  onChange={handleProfileChange}
                />
              </div>
            </form>
          </div>

          {/* Sticky Submit Bar */}
          <div className="fixed bottom-0 left-0 lg:left-72 right-0 z-30 border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 py-4 flex items-center justify-between">
              <button
                onClick={handleSaveDraft}
                disabled={isSubmitting}
                className="text-sm font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors active:scale-95 disabled:opacity-50 flex items-center gap-2"
                type="button"
              >
                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : null}
                {isSubmitting ? "Saving..." : "Save as Draft"}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-2.5 rounded-lg bg-primary hover:bg-green-400 text-text-main text-sm font-bold shadow-md shadow-primary/20 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    Publish Profile
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
