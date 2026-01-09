"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/firebase-auth-provider";

interface RouteProtectionProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredUserType?: "instructor" | "studio";
  redirectTo?: string;
}

export default function RouteProtection({
  children,
  requireAuth = true,
  requiredUserType,
  redirectTo = "/",
}: RouteProtectionProps) {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

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
    }
  }, [user, profile, loading, requireAuth, requiredUserType, redirectTo, router]);

  if (loading) {
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

  return <>{children}</>;
}
