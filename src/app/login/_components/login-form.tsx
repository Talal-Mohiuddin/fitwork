"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import LoginAction, { GoogleLoginAction, sendPasswordReset, createGoogleUserProfile } from "../action";
import { useStore } from "@/store/zustand";
import { Eye, EyeOff, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import type { mode } from "@/types";

const GoogleIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
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

type ViewMode = "login" | "forgot-password" | "role-selection";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("login");
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useStore();

  // Check if user just verified email
  useEffect(() => {
    const verified = searchParams.get("verified");
    if (verified === "true") {
      toast.success("Email verified successfully! You can now log in.");
    }
  }, [searchParams]);

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    try {
      setLoading(true);
      const result = await LoginAction(email, password);
      
      if (result.success && result.user) {
        toast.success(result.message || "Login successful!");
        setUser(result.user);
        
        // Redirect based on profile completion status
        if (!result.user.profile_completed) {
          router.push(`/profile-setup/${result.user.user_type}`);
        } else {
          router.push(`/dashboard/${result.user.user_type}`);
        }
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Login failed");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const result = await GoogleLoginAction();
      
      if (result.success) {
        if (result.requiresRoleSelection) {
          // New Google user - show role selection
          setViewMode("role-selection");
          toast.info("Please select your role to continue");
        } else if (result.user) {
          toast.success(result.message || "Google login successful!");
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
      toast.error(error.message || "Google login failed");
      console.error("Google login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = async (role: mode) => {
    try {
      setLoading(true);
      const result = await createGoogleUserProfile(role);
      
      if (result.success && result.user) {
        toast.success("Account created successfully!");
        setUser(result.user);
        router.push(`/profile-setup/${role}`);
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    try {
      setLoading(true);
      const result = await sendPasswordReset(email);
      
      if (result.success) {
        setResetEmailSent(true);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  // Role Selection View (for new Google users)
  if (viewMode === "role-selection") {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-white dark:bg-background-dark px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-slate-900 dark:text-white text-3xl font-bold mb-3">
              How will you use Fitgig?
            </h1>
            <p className="text-neutral-gray dark:text-slate-400 text-base">
              Select your role to get started
            </p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => handleRoleSelect("instructor")}
              disabled={loading}
              className="w-full p-6 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-primary hover:bg-primary/5 transition-all group disabled:opacity-50"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">I'm an Instructor</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Find gigs and get paid fast</p>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => handleRoleSelect("studio")}
              disabled={loading}
              className="w-full p-6 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-primary hover:bg-primary/5 transition-all group disabled:opacity-50"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">I'm a Studio</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Find top talent on demand</p>
                </div>
              </div>
            </button>
          </div>
          
          <button
            onClick={() => setViewMode("login")}
            className="mt-6 flex items-center justify-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors w-full"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </button>
        </div>
      </div>
    );
  }

  // Forgot Password View
  if (viewMode === "forgot-password") {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-white dark:bg-background-dark px-4">
        <div className="w-full max-w-md">
          <button
            onClick={() => {
              setViewMode("login");
              setResetEmailSent(false);
            }}
            className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </button>

          {resetEmailSent ? (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-slate-900 dark:text-white text-2xl font-bold mb-3">
                Check your email
              </h1>
              <p className="text-neutral-gray dark:text-slate-400 mb-6">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <button
                onClick={() => {
                  setViewMode("login");
                  setResetEmailSent(false);
                  setEmail("");
                }}
                className="text-primary font-semibold hover:text-primary-hover"
              >
                Return to login
              </button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-slate-900 dark:text-white text-3xl font-bold mb-3">
                  Reset your password
                </h1>
                <p className="text-neutral-gray dark:text-slate-400 text-base">
                  Enter your email and we'll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-5">
                <div className="flex flex-col gap-2">
                  <label className="text-slate-900 dark:text-slate-200 text-sm font-medium">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      className="flex w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 h-12 pl-12 pr-4 text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder="user@example.com"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-lg bg-primary text-white font-bold hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending..." : "Send reset link"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    );
  }

  // Main Login View
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-white dark:bg-background-dark px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
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

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-slate-900 dark:text-white text-3xl font-bold mb-2">
            Welcome back
          </h1>
          <p className="text-neutral-gray dark:text-slate-400 text-base">
            Manage your studio or find your next gig in minutes.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleEmailPasswordLogin} className="space-y-5">
          <div className="flex flex-col gap-2">
            <label className="text-slate-900 dark:text-slate-200 text-sm font-medium">
              Email address
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
            <div className="flex items-center justify-between">
              <label className="text-slate-900 dark:text-slate-200 text-sm font-medium">
                Password
              </label>
              <button
                type="button"
                onClick={() => setViewMode("forgot-password")}
                className="text-sm text-primary hover:text-primary-hover font-medium"
              >
                Forgot password?
              </button>
            </div>
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-lg bg-primary text-white font-bold hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          <span className="text-xs text-slate-500 dark:text-slate-400">Or continue with</span>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
        </div>

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full h-12 flex items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <GoogleIcon />
          <span>Google</span>
        </button>

        {/* Sign up link */}
        <div className="mt-8 text-center">
          <p className="text-neutral-gray dark:text-slate-400 text-sm">
            New to Fitgig?{" "}
            <Link
              href="/signup"
              className="text-primary font-semibold hover:text-primary-hover hover:underline"
            >
              Create an account
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

export default LoginForm;
