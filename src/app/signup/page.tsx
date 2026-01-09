"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RoleSelection } from "./_components/role-selection";
import { SignupForm } from "./_components/signup-form";

const Signup = () => {
  const [roleSelected, setRoleSelected] = useState<
    "instructor" | "studio" | null
  >(null);
  const router = useRouter();

  const handleRoleSelect = (role: string) => {
    if (role === "instructor" || role === "studio") {
      setRoleSelected(role);
      router.push(`/signup?type=${role}`); // Redirect to the signup form with the selected role
    }
  };

  return (
    <div className="min-h-screen flex flex-col  max-w-7xlmx-auto">
      {!roleSelected ? (
        <RoleSelection onSelect={handleRoleSelect} />
      ) : (
        // The signup form will be handled by the redirected page
        <div className="flex items-center justify-center h-screen">
          <SignupForm role={roleSelected} />
        </div>
      )}
    </div>
  );
};

export default Signup;
