"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { auth } from "@/firebase";
import { completeMagicLinkSignIn } from "@/app/auth-actions";
import { useStore } from "@/store/zustand";
import { toast } from "sonner";

export default function MagicLinkCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Completing sign in...");
  const { setUser } = useStore();

  useEffect(() => {
    const completeSignIn = async () => {
      try {
        // Check if this is a sign-in with email link
        if (!isSignInWithEmailLink(auth, window.location.href)) {
          setStatus("error");
          setMessage("Invalid sign-in link. Please request a new magic link.");
          return;
        }

        // Get email from URL params or localStorage
        let email = searchParams.get("email");
        if (!email) {
          email = window.localStorage.getItem("emailForSignIn");
        }

        if (!email) {
          setStatus("error");
          setMessage("Could not find your email. Please try signing in again.");
          return;
        }

        // Complete sign-in with Firebase
        const result = await signInWithEmailLink(auth, email, window.location.href);
        const user = result.user;

        // Clear stored email
        window.localStorage.removeItem("emailForSignIn");
        window.localStorage.removeItem("userTypeForSignIn");

        // Complete sign-in on server (create/get profile)
        const serverResult = await completeMagicLinkSignIn(user.uid, email);

        if (serverResult.success && serverResult.user) {
          setUser(serverResult.user);
          setStatus("success");
          setMessage("Sign in successful! Redirecting...");
          toast.success("Signed in successfully!");

          // Redirect based on profile completion
          setTimeout(() => {
            if (serverResult.user?.profile_completed) {
              router.push(`/dashboard/${serverResult.user.user_type}`);
            } else if (serverResult.isNewUser) {
              router.push(`/profile-setup/${serverResult.user?.user_type}`);
            } else {
              router.push(`/dashboard/${serverResult.user?.user_type}`);
            }
          }, 1500);
        } else {
          setStatus("error");
          setMessage(serverResult.message || "Failed to complete sign in");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to complete sign in. The link may have expired.";
        console.error("Magic link sign-in error:", error);
        setStatus("error");
        setMessage(errorMessage);
      }
    };

    completeSignIn();
  }, [router, searchParams, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
      <div className="max-w-md w-full mx-auto p-8">
        <div className="text-center">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-16 text-[#21c55e]">
              <svg
                className="w-full h-full"
                fill="none"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 16V12C12 7.58172 15.5817 4 20 4H28C32.4183 4 36 7.58172 36 12V16"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <rect
                  x="8"
                  y="16"
                  width="32"
                  height="28"
                  rx="4"
                  fill="currentColor"
                />
                <path
                  d="M18 24H30M18 24V40M18 32H26"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* Status indicator */}
          {status === "loading" && (
            <div className="mb-6">
              <div className="w-12 h-12 border-4 border-[#21c55e] border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          )}

          {status === "success" && (
            <div className="mb-6">
              <div className="w-12 h-12 bg-[#21c55e] rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="mb-6">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          )}

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            {status === "loading" && "Completing Sign In"}
            {status === "success" && "Welcome!"}
            {status === "error" && "Sign In Failed"}
          </h1>

          <p className="text-slate-500 dark:text-slate-400 mb-6">
            {message}
          </p>

          {status === "error" && (
            <button
              onClick={() => router.push("/")}
              className="px-6 py-2 bg-[#21c55e] hover:bg-[#1ea853] text-white font-medium rounded-lg transition-colors"
            >
              Go to Home
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
