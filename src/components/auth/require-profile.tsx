"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/firebase-auth-provider";
import { useInstructorProfile } from "@/hooks/useInstructorProfile";
import { Loader2 } from "lucide-react";

interface RequireProfileProps {
  children: React.ReactNode;
  userType?: "instructor" | "studio";
}

/**
 * Wrapper component that requires users to have a completed profile.
 * Redirects to profile setup if profile is not completed.
 */
export default function RequireProfile({ 
  children, 
  userType = "instructor" 
}: RequireProfileProps) {
  const router = useRouter();
  const { user, profile: authProfile, loading: authLoading } = useAuth();
  const instructorProfile = useInstructorProfile();

  useEffect(() => {
    // Wait for auth to load
    if (authLoading) return;

    // If not logged in, redirect to login
    if (!user) {
      router.push("/login");
      return;
    }

    // Wait for profile check to complete
    if (instructorProfile.loading) return;

    // For instructors, check if profile is submitted
    if (userType === "instructor" || authProfile?.user_type === "instructor") {
      if (!instructorProfile.isSubmitted) {
        // Redirect to profile setup
        router.push("/profile-setup/instructor");
        return;
      }
    }

    // For studios, add similar logic when needed
    // if (userType === "studio" || authProfile?.user_type === "studio") {
    //   // Check studio profile completion
    // }
  }, [
    user,
    authProfile,
    authLoading,
    instructorProfile.loading,
    instructorProfile.isSubmitted,
    userType,
    router,
  ]);

  // Show loading state
  if (authLoading || instructorProfile.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
          <p className="text-slate-500">Checking profile...</p>
        </div>
      </div>
    );
  }

  // If not logged in, don't render
  if (!user) {
    return null;
  }

  // If instructor profile not submitted, don't render (redirect will happen)
  if (
    (userType === "instructor" || authProfile?.user_type === "instructor") &&
    !instructorProfile.isSubmitted
  ) {
    return null;
  }

  return <>{children}</>;
}
