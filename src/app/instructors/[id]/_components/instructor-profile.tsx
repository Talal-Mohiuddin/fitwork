"use client";

import {
  Share2,
  MapPin,
  CheckCircle,
  Star,
  Calendar,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "./stat-card";
import { AvailabilityGrid } from "./availability-grid";
import { ExperienceTimeline } from "./experience-timeline";
import { CertificationCard } from "./certification-card";
import { instructors } from "@/data";
import { useParams } from "next/navigation";

export function InstructorProfile() {
  const params = useParams();
  const instructorId = params.id as string;

  const instructor = instructors.find((i) => i.id === instructorId);

  if (!instructor) {
    return (
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Instructor not found
          </h2>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
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
                <img
                  src={
                    instructor.profile_photo ||
                    "https://via.placeholder.com/400"
                  }
                  alt={instructor.full_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-900 p-1 rounded-full">
                <div className="bg-green-500 text-white rounded-full p-2 shadow-md">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">
                    {instructor.full_name}
                  </h1>
                  <div className="flex  gap-4 text-sm text-slate-600 dark:text-slate-400 mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{instructor.location}</span>
                    </div>
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

              {/* Specialties */}
              <div className="flex flex-wrap gap-2 mb-5">
                {instructor.fitness_styles?.map((style) => (
                  <span
                    key={style}
                    className="px-3 py-1.5 bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 rounded-lg text-xs font-bold text-blue-700 dark:text-slate-300 uppercase tracking-wide"
                  >
                    {style}
                  </span>
                ))}
              </div>

              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base max-w-2xl">
                {instructor.bio}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard
              label="Experience"
              value={`${instructor.years_of_experience} Years`}
            />
            <StatCard
              label="Classes Taught"
              value={`${instructor.classes_taught}+`}
            />
            <StatCard
              label="Review Score"
              value={instructor.rating?.toString() || "N/A"}
              icon={
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              }
            />
          </div>

          {/* Availability */}
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

          {/* Experience & Certifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ExperienceTimeline experiences={instructor.experience} />
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-green-500" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Certifications
                </h2>
              </div>
              <div className="space-y-3">
                {instructor.certification_details?.map((cert, idx) => (
                  <CertificationCard
                    key={idx}
                    title={cert.title}
                    issued={cert.issued}
                    icon={cert.icon}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Gallery */}
          {instructor.gallery_images &&
            instructor.gallery_images.length > 0 && (
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
                        src={image}
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
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm sticky top-24">
            <div className="">
              <div className="flex justify-between items-center mb-6 border-b b-2 pb-3">
                <div>
                  <h1>Standard Rate</h1>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                    ${instructor.hourly_rate || 75}{" "}
                    <span className="text-sm text-gray-500">/ class</span>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center gap-1 ">
                  <div className="flex gap-2 items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {instructor.rating}
                    </span>
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {instructor.review_count} Reviews
                  </span>
                </div>
              </div>

              <Button className="w-full bg-green-500 hover:bg-green-600 text-white mb-3">
                Invite to Gig
              </Button>
              <button className="w-full text-sm font-semibold text-slate-900 dark:text-white py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                Message {instructor.full_name?.split(" ")[0]}
              </button>
              <div className="flex items-center justify-center gap-2 text-green-600 text-sm font-medium mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <CheckCircle className="w-4 h-4" />
                Identity Verified
              </div>
            </div>
            <div className="mt-8 space-y-4 border p-6 rounded-md bg-[#f4f8fe]">
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
                    {instructor.fitness_styles?.[0] || "your required"}{" "}
                    disciplines.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-500 mt-0.5">📅</span>
                  <span>Available for your requested time slots.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
