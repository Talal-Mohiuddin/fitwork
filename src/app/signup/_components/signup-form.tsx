"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signupAction, googleSignupAction, createGoogleUserProfile, resendVerificationEmail } from "../action";
import { Eye, EyeOff, CheckCircle, Mail, ArrowLeft } from "lucide-react";
import { useStore } from "@/store/zustand";
import type { mode } from "@/types";

const GoogleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
  >
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-1 7.28-2.69l-3.57-2.77c-.99.69-2.26 1.1-3.71 1.1-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.11c-.22-.67-.35-1.39-.35-2.11s.13-1.44.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l2.66-2.84z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51z"
    />
  </svg>
);

type ViewMode = "form" | "verification-sent" | "role-selection";

export const SignupForm = ({ role }: { role: mode }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("form");
  const [resendLoading, setResendLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useStore();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !fullName) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const result = await signupAction(email, password, role, {
        full_name: fullName,
      });

      if (result.success) {
        if (result.requiresEmailVerification) {
          setViewMode("verification-sent");
          toast.success("Please check your email to verify your account.");
        } else if (result.user) {
          toast.success("Signup successful!");
          setUser(result.user);
          router.push(`/profile-setup/${role}`);
        }
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error("An error occurred during signup.");
      console.error("Signup error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setLoading(true);
      const result = await googleSignupAction();

      if (result.success) {
        if (result.requiresRoleSelection) {
          // New Google user - create profile with the pre-selected role
          const profileResult = await createGoogleUserProfile(role);
          if (profileResult.success && profileResult.user) {
            toast.success("Account created successfully!");
            setUser(profileResult.user);
            router.push(`/profile-setup/${role}`);
          } else {
            toast.error(profileResult.message);
          }
        } else if (result.user) {
          toast.success("Welcome back! You already have an account.");
          setUser(result.user);
          if (!result.user.profile_completed) {
            router.push(`/profile-setup/${result.user.user_type}`);
          } else {
            router.push(`/dashboard/${result.user.user_type}`);
          }
        }
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error("An error occurred during Google signup.");
      console.error("Google signup error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setResendLoading(true);
      const result = await resendVerificationEmail();
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error("Failed to resend verification email.");
    } finally {
      setResendLoading(false);
    }
  };

  const roleDisplay = role === "instructor" ? "Instructor" : "Studio";

  // Email Verification Sent View
  if (viewMode === "verification-sent") {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-white dark:bg-background-dark px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Mail className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          
          <h1 className="text-slate-900 dark:text-white text-2xl font-bold mb-3">
            Verify your email
          </h1>
          
          <p className="text-neutral-gray dark:text-slate-400 mb-2">
            We've sent a verification email to:
          </p>
          <p className="text-slate-900 dark:text-white font-semibold mb-6">
            {email}
          </p>
          
          <p className="text-neutral-gray dark:text-slate-400 text-sm mb-8">
            Click the link in the email to verify your account. Once verified, you can log in and complete your profile.
          </p>
          
          <div className="space-y-4">
            <Link
              href="/login"
              className="w-full h-12 flex items-center justify-center rounded-lg bg-primary text-white font-bold hover:bg-primary-hover transition-all"
            >
              Go to Login
            </Link>
            
            <button
              onClick={handleResendVerification}
              disabled={resendLoading}
              className="w-full h-12 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
            >
              {resendLoading ? "Sending..." : "Resend verification email"}
            </button>
          </div>
          
          <p className="mt-8 text-xs text-slate-400 dark:text-slate-500">
            Didn't receive the email? Check your spam folder or try resending.
          </p>
        </div>
      </div>
    );
  }

  // Signup Form View
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-white dark:bg-background-dark px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 text-[#21c55e]">
            <svg className="w-full h-full" fill="none" viewBox="0 0 48 48">
              <path
                clipRule="evenodd"
                d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z"
                fill="currentColor"
                fillRule="evenodd"
              />
            </svg>
          </div>
          <span className="text-xl font-bold text-[#21c55e]">Fitgig</span>
        </div>

        {/* Back button */}
        <Link
          href="/signup"
          className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Change role
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="inline-block px-3 py-1 mb-3 text-xs font-medium text-primary bg-primary/10 rounded-full">
            Joining as {roleDisplay}
          </div>
          <h1 className="text-slate-900 dark:text-white text-3xl font-bold mb-2">
            Create your account
          </h1>
          <p className="text-neutral-gray dark:text-slate-400 text-base">
            Join thousands of fitness professionals earning on their own terms.
          </p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="space-y-5">
          <div className="flex flex-col gap-2">
            <label className="text-slate-900 dark:text-slate-200 text-sm font-medium">
              Full Name
            </label>
            <input
              className="flex w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 h-12 px-4 text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="John Doe"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-slate-900 dark:text-slate-200 text-sm font-medium">
              Email Address
            </label>
            <input
              className="flex w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 h-12 px-4 text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="user@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-slate-900 dark:text-slate-200 text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <input
                className="flex w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 h-12 px-4 pr-12 text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="••••••••••••"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-slate-500">Must be at least 6 characters</p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-slate-900 dark:text-slate-200 text-sm font-medium">
              Confirm Password
            </label>
            <div className="relative">
              <input
                className="flex w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 h-12 px-4 pr-12 text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="••••••••••••"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-lg bg-primary text-white font-bold hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          <span className="text-xs text-slate-500 dark:text-slate-400">Or continue with</span>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
        </div>

        {/* Google Signup */}
        <button
          onClick={handleGoogleSignup}
          disabled={loading}
          type="button"
          className="w-full h-12 flex items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <GoogleIcon />
          <span>Google</span>
        </button>

        {/* Login link */}
        <div className="mt-8 text-center">
          <p className="text-neutral-gray dark:text-slate-400 text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary font-semibold hover:text-primary-hover hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-xs text-slate-400 dark:text-slate-600">
          © 2024 Fitgig Platform.
        </footer>
      </div>
    </div>
  );
};
