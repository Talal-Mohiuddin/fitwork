"use client";

import React, { useState } from "react";
import {
  Bell,
  ArrowRight,
  Dumbbell,
  Tag,
  MapPin,
  Sparkles,
  Headphones,
  DollarSign,
  Image as ImageIcon,
} from "lucide-react";
import { Profile } from "@/types";
import StudioSideNavigation from "./_components/StudioSideNavigation";
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

export default function StudioProfileSetup() {
  const [activeStep, setActiveStep] = useState<FormStep>("identity");
  const [completionPercentage, setCompletionPercentage] = useState(15);
  const [studioProfile, setStudioProfile] = useState<Partial<Profile>>({
    user_type: "studio",
    name: "Pure Flow Yoga",
  });

  const handleProfileChange = (updates: Partial<Profile>) => {
    setStudioProfile((prev) => ({ ...prev, ...updates }));
    updateCompletionPercentage();
  };

  const updateCompletionPercentage = () => {
    let completed = 0;
    const total = 6;

    if (studioProfile.name) completed++;
    if (studioProfile.location) completed++;
    if (studioProfile.styles && studioProfile.styles.length > 0) completed++;
    if (studioProfile.amenities && studioProfile.amenities.length > 0)
      completed++;
    if (studioProfile.images && studioProfile.images.length > 0) completed++;
    if (studioProfile.website) completed++;

    setCompletionPercentage(Math.round((completed / total) * 100));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting studio profile:", studioProfile);
    // TODO: API call to save profile
  };

  const sections: { id: FormStep; label: string; icon: React.ReactNode }[] = [
    { id: "identity", label: "Identity", icon: <Tag size={20} /> },
    { id: "contact", label: "Contact & Location", icon: <MapPin size={20} /> },
    { id: "offerings", label: "Class Styles", icon: <Sparkles size={20} /> },
    {
      id: "expectations",
      label: "Instructor Exp.",
      icon: <Headphones size={20} />,
    },
    {
      id: "compensation",
      label: "Compensation",
      icon: <DollarSign size={20} />,
    },
    { id: "gallery", label: "Gallery", icon: <ImageIcon size={20} /> },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}

      <div className="flex-1 w-full max-w-[1280px] mx-auto p-4 md:p-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar Navigation */}
          <StudioSideNavigation
            sections={sections}
            activeStep={activeStep}
            onStepChange={(step) => setActiveStep(step as FormStep)}
            completionPercentage={completionPercentage}
          />

          {/* Main Content */}
          <main className="flex-1 w-full bg-white dark:bg-[#1a2c20] rounded-xl shadow-sm border border-[#f0f4f2] dark:border-[#2a4030] overflow-hidden">
            <div className="p-8 border-b border-[#f0f4f2] dark:border-[#2a4030]">
              <h1 className="text-3xl font-black leading-tight tracking-[-0.033em] mb-2 text-text-main dark:text-white">
                Create Your Studio Profile
              </h1>
              <p className="text-text-secondary text-base">
                Build your talent OS. Attract the best instructors with
                transparency and operational clarity.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="divide-y divide-[#f0f4f2] dark:divide-[#2a4030]"
            >
              {activeStep === "identity" && (
                <IdentitySection
                  profile={studioProfile}
                  onChange={handleProfileChange}
                />
              )}
              {activeStep === "contact" && (
                <ContactSection
                  profile={studioProfile}
                  onChange={handleProfileChange}
                />
              )}
              {activeStep === "offerings" && (
                <OfferingsSection
                  profile={studioProfile}
                  onChange={handleProfileChange}
                />
              )}
              {activeStep === "expectations" && (
                <InstructorExpectationsSection
                  profile={studioProfile}
                  onChange={handleProfileChange}
                />
              )}
              {activeStep === "compensation" && (
                <CompensationSection
                  profile={studioProfile}
                  onChange={handleProfileChange}
                />
              )}
              {activeStep === "gallery" && (
                <GallerySection
                  profile={studioProfile}
                  onChange={handleProfileChange}
                />
              )}

              {/* Footer Actions */}
              <div className="p-6 bg-gray-50 dark:bg-[#15241b]/50 flex items-center justify-between sticky bottom-0 z-40 border-t border-[#f0f4f2] dark:border-[#2a4030] backdrop-blur-sm">
                <button
                  className="px-6 py-2.5 rounded-lg text-sm font-bold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  type="button"
                >
                  Cancel
                </button>
                <div className="flex items-center gap-4">
                  <button
                    className="hidden sm:block px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-transparent text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#233529] transition-all"
                    type="button"
                  >
                    Save Draft
                  </button>
                  <button
                    className="px-8 py-2.5 rounded-lg bg-primary hover:bg-green-400 text-text-main text-sm font-bold shadow-md shadow-primary/20 transition-all transform active:scale-95 flex items-center gap-2"
                    type="submit"
                  >
                    Publish Profile
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
}
