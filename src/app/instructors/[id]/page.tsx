"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { InstructorProfile } from "./_components/instructor-profile";
import { getInstructorProfile } from "@/services/instructorProfileService";
import { Profile } from "@/types";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function InstructorPage() {
  const params = useParams();
  const instructorId = params.id as string;
  const [instructor, setInstructor] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInstructor = async () => {
      try {
        setLoading(true);
        const profile = await getInstructorProfile(instructorId);
        setInstructor(profile);
      } catch (err) {
        console.error("Error fetching instructor:", err);
        setError("Failed to load instructor profile");
      } finally {
        setLoading(false);
      }
    };

    if (instructorId) {
      fetchInstructor();
    }
  }, [instructorId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !instructor) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {error || "Instructor not found"}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              The instructor profile you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <InstructorProfile instructor={instructor} />
    </div>
  );
}
