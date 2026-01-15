"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RoleSelection } from "./_components/role-selection";
import { SignupForm } from "./_components/signup-form";
import type { mode } from "@/types";

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("type") as mode | null;

  const handleRoleSelect = (role: string) => {
    if (role === "instructor" || role === "studio") {
      router.push(`/signup?type=${role}`);
    }
  };

  // If role is selected via URL param, show signup form
  if (roleParam === "instructor" || roleParam === "studio") {
    return <SignupForm role={roleParam} />;
  }

  // Otherwise show role selection
  return <RoleSelection onSelect={handleRoleSelect} />;
}

const Signup = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-background-dark">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <SignupContent />
    </Suspense>
  );
};

export default Signup;
