"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/store/firebase-auth-provider";
import { checkInstructorProfileStatus } from "@/services/instructorProfileService";
import type { Profile } from "@/types";

interface ProfileCheckResult {
  loading: boolean;
  hasProfile: boolean;
  isSubmitted: boolean;
  isDraft: boolean;
  profile: Profile | null;
  error: string | null;
}

/**
 * Hook to check if the current user has a completed instructor profile
 * Returns the profile status and data
 */
export function useInstructorProfile(): ProfileCheckResult {
  const { user, loading: authLoading } = useAuth();
  const [result, setResult] = useState<ProfileCheckResult>({
    loading: true,
    hasProfile: false,
    isSubmitted: false,
    isDraft: false,
    profile: null,
    error: null,
  });

  useEffect(() => {
    async function checkProfile() {
      if (authLoading) {
        return;
      }

      if (!user) {
        setResult({
          loading: false,
          hasProfile: false,
          isSubmitted: false,
          isDraft: false,
          profile: null,
          error: null,
        });
        return;
      }

      try {
        const status = await checkInstructorProfileStatus(user.uid);
        setResult({
          loading: false,
          hasProfile: status.hasProfile,
          isSubmitted: status.isSubmitted,
          isDraft: status.isDraft,
          profile: status.profile,
          error: null,
        });
      } catch (err) {
        console.error("Error checking profile:", err);
        setResult({
          loading: false,
          hasProfile: false,
          isSubmitted: false,
          isDraft: false,
          profile: null,
          error: "Failed to check profile status",
        });
      }
    }

    checkProfile();
  }, [user, authLoading]);

  return result;
}

/**
 * Hook to require a completed instructor profile
 * Will redirect to profile setup if not completed
 */
export function useRequireInstructorProfile(redirectTo: string = "/profile-setup/instructor") {
  const { user, loading: authLoading } = useAuth();
  const profileCheck = useInstructorProfile();

  return {
    ...profileCheck,
    shouldRedirect: !profileCheck.loading && !authLoading && user && !profileCheck.isSubmitted,
    redirectTo,
  };
}
