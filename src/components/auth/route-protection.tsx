"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/firebase-auth-provider";
import { useInstructorProfile } from "@/hooks/useInstructorProfile";

interface RouteProtectionProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredUserType?: "instructor" | "studio";
  requireCompletedProfile?: boolean;
  redirectTo?: string;
}

export default function RouteProtection({
  children,
  requireAuth = true,
  requiredUserType,
  requireCompletedProfile = false,
  redirectTo = "/",
}: RouteProtectionProps) {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const instructorProfile = useInstructorProfile();

  useEffect(() => {
    if (loading || (requireCompletedProfile && instructorProfile.loading)) return;

    if (requireAuth && !user) {
      router.push(redirectTo);
      return;
    }

    if (requiredUserType && profile?.user_type !== requiredUserType) {
      // Redirect to correct dashboard if user type doesn't match
      if (profile?.user_type) {
        router.push(`/dashboard/${profile.user_type}`);
      } else {
        router.push(redirectTo);
      }
      return;
    }

    // Check if profile is required and user is an instructor
    if (
      requireCompletedProfile &&
      user &&
      profile?.user_type === "instructor" &&
      !instructorProfile.isSubmitted
    ) {
      // Redirect to profile setup if profile is not completed
      router.push("/profile-setup/instructor");
      return;
    }
  }, [
    user,
    profile,
    loading,
    requireAuth,
    requiredUserType,
    requireCompletedProfile,
    redirectTo,
    router,
    instructorProfile.loading,
    instructorProfile.isSubmitted,
  ]);

  if (loading || (requireCompletedProfile && instructorProfile.loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#21c55e] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return null;
  }

  if (requiredUserType && profile?.user_type !== requiredUserType) {
    return null;
  }

  if (
    requireCompletedProfile &&
    user &&
    profile?.user_type === "instructor" &&
    !instructorProfile.isSubmitted
  ) {
    return null;
  }

  return <>{children}</>;
}
