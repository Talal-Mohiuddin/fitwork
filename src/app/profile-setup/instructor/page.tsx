"use client";

import React, { useState } from "react";
import { Bell, ArrowRight, Dumbbell } from "lucide-react";
import { Profile, Experience, Certification } from "@/types";
import BasicsSection from "./_components/BasicsSection";
import ExperienceSection from "./_components/ExperienceSection";
import CertificationsSection from "./_components/CertificationsSection";
import AvailabilitySection from "./_components/AvailabilitySection";
import MediaSection from "./_components/MediaSection";
import SideNavigation from "./_components/SideNavigation";

type FormStep = "basics" | "experience" | "certs" | "availability" | "media";

export default function InstructorProfileSetup() {
  const [activeStep, setActiveStep] = useState<FormStep>("basics");
  const [completionPercentage, setCompletionPercentage] = useState(60);
  const [profile, setProfile] = useState<Partial<Profile>>({
    user_type: "instructor",
    full_name: "Alex Morgan",
    email: "alex@fitwork.com",
  });

  const handleProfileChange = (updates: Partial<Profile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
    updateCompletionPercentage();
  };

  const updateCompletionPercentage = () => {
    let completed = 0;
    const total = 5;

    if (profile.full_name && profile.headline) completed++;
    if (profile.experience && profile.experience.length > 0) completed++;
    if (profile.certifications && profile.certifications.length > 0)
      completed++;
    if (profile.availability_slots && profile.availability_slots.length > 0)
      completed++;
    if (profile.gallery_images && profile.gallery_images.length > 0)
      completed++;

    setCompletionPercentage(Math.round((completed / total) * 100));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting profile:", profile);
    // TODO: API call to save profile
  };

  const sections: { id: FormStep; label: string; icon: string }[] = [
    { id: "basics", label: "The Basics", icon: "person" },
    { id: "experience", label: "Work Experience", icon: "work" },
    { id: "certs", label: "Certifications", icon: "school" },
    { id: "availability", label: "Availability", icon: "schedule" },
    { id: "media", label: "Media", icon: "image" },
  ];

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden">
      {/* Header */}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <SideNavigation
          sections={sections}
          activeStep={activeStep}
          onStepChange={(step) => setActiveStep(step as FormStep)}
          completionPercentage={completionPercentage}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-10 lg:p-12 scroll-smooth">
          <div className="mx-auto max-w-4xl">
            <div className="mb-10">
              <h1 className="text-4xl font-display font-black tracking-tight text-text-main dark:text-white">
                Complete Your Profile
              </h1>
              <p className="text-lg text-text-secondary mt-2">
                Studios are looking for talent like you. Let's make your profile
                stand out.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-12 pb-24"
            >
              {activeStep === "basics" && (
                <BasicsSection
                  profile={profile}
                  onChange={handleProfileChange}
                />
              )}
              {activeStep === "experience" && (
                <ExperienceSection
                  profile={profile}
                  onChange={handleProfileChange}
                />
              )}
              {activeStep === "certs" && (
                <CertificationsSection
                  profile={profile}
                  onChange={handleProfileChange}
                />
              )}
              {activeStep === "availability" && (
                <AvailabilitySection
                  profile={profile}
                  onChange={handleProfileChange}
                />
              )}
              {activeStep === "media" && (
                <MediaSection
                  profile={profile}
                  onChange={handleProfileChange}
                />
              )}

              {/* Submit Bar */}
              <div className="sticky bottom-0 -mx-4 -mb-4 md:mx-0 md:mb-0 z-30 flex items-center justify-between border-t border-gray-200 dark:border-gray-800 bg-surface-light/95 dark:bg-surface-dark/95 p-4 backdrop-blur-md md:static md:border-0 md:bg-transparent md:p-0 md:mt-6">
                <button
                  className="text-sm font-bold text-text-secondary hover:text-text-main dark:hover:text-white transition-colors"
                  type="button"
                >
                  Save as Draft
                </button>
                <div className="flex gap-4">
                  <button
                    className="rounded-lg px-6 py-3 text-sm font-bold text-text-main hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800 transition-colors hidden sm:block"
                    type="button"
                  >
                    Preview Profile
                  </button>
                  <button
                    className="flex items-center gap-2 rounded-lg bg-primary px-8 py-3 text-sm font-bold text-black shadow-lg shadow-primary/25 hover:bg-primary-dark hover:scale-[1.02] active:scale-[0.98] transition-all"
                    type="submit"
                  >
                    Submit Profile
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
