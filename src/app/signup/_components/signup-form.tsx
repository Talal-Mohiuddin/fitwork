"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { signupAction } from "../action";
import { Eye, Star } from "lucide-react";
import React from "react";
import { useStore } from "@/store/zustand";

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

export const SignupForm = ({ role }: { role: "instructor" | "studio" }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useStore();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !fullName) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      const result = await signupAction(email, password, role, {
        full_name: fullName,
      });
      console.log("Signup result:", result);
      if (result.success) {
        toast.success("Signup successful!");
        setUser(result.user);
        router.push("/dashboard"); // Redirect to dashboard or home
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

  return (
    <div className="relative flex h-screen max-w-7xl w-full overflow-hidden">
      <div className="flex w-full flex-col justify-between bg-white dark:bg-background-dark px-6 py-8 sm:px-12 md:w-1/2 lg:px-20 xl:px-24 border-r border-slate-100 dark:border-slate-800">
        <div className="mx-auto flex w-full  flex-col justify-center">
          <div className="mb-10">
            <h1 className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em] mb-3">
              Create your account
            </h1>
            <p className="text-neutral-gray dark:text-slate-400 text-base font-normal leading-normal">
              Join thousands of fitness professionals earning on their own
              terms.
            </p>
          </div>
          <form className="flex flex-col gap-5" onSubmit={handleSignup}>
            <div className="flex flex-col gap-2">
              <label className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal">
                Full Name
              </label>
              <input
                className="form-input flex w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 h-12 p-[15px] text-base"
                placeholder="John Doe"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal">
                Email Address
              </label>
              <input
                className="form-input flex w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 h-12 p-[15px] text-base"
                placeholder="user@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal">
                Password
              </label>
              <input
                className="form-input flex w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 h-12 p-[15px] text-base"
                placeholder="••••••••••••"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <button
              className="mt-2 flex h-12 w-full items-center justify-center rounded-lg bg-primary px-6 text-base font-bold text-white shadow-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 disabled:opacity-50"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing up..." : "Sign Up"}
            </button>
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-100 dark:border-slate-700"></div>
              <span className="flex-shrink-0 mx-4 text-slate-400 dark:text-slate-500 text-sm">
                Or continue with
              </span>
              <div className="flex-grow border-t border-slate-100 dark:border-slate-700"></div>
            </div>
            <button
              className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 text-base font-medium text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              type="button"
            >
              <GoogleIcon />
              <span>Google</span>
            </button>
          </form>
          <div className="mt-8 text-center">
            <p className="text-neutral-gray dark:text-slate-400 text-sm font-normal">
              Already have an account?{" "}
              <a
                className="text-primary font-semibold hover:text-primary-hover hover:underline"
                href="#"
              >
                Log in
              </a>
            </p>
          </div>
        </div>
        <footer className="text-xs text-slate-400 dark:text-slate-600">
          © 2024 Fitgig Platform.
        </footer>
      </div>
      <div className="hidden md:flex md:w-1/2 relative bg-slate-100 dark:bg-slate-900">
        <img
          alt="Minimalist bright yoga studio space with wooden floor"
          className="absolute inset-0 h-full w-full object-cover opacity-90 grayscale-[20%]"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3nLlEhz8m0pTtKAD8dxTcjAjH9I0NNTsok7y37aDU6Y9zVFVDSl23d2uZhtRAWqzxDX8nPkOwrQqqGS7n6GtTLWYIVGDYWzcEYhQ-2wZudm1jsV69Z1E_IfV3JNAEsB8sNIGi9NcmwyRnekzijQHIR4rVqwRDmbq6RiZ-KwGMsDZ3KnoKTZNBZlaUS3VIMmAc2UzpDqRLWVsWShUsbM_j_yY2KcDdKJ4A9pYRpox5--qUFfXbvLAhM8gRhTJJRo_iXLqbnfWTj40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-12 lg:p-16 text-white">
          <div className="max-w-md">
            <div className="mb-6 flex gap-1 text-green-500">
              <Star className="h-5 w-5" />
              <Star className="h-5 w-5" />
              <Star className="h-5 w-5" />
              <Star className="h-5 w-5" />
              <Star className="h-5 w-5" />
            </div>
            <blockquote className="text-2xl lg:text-3xl font-medium leading-tight tracking-tight mb-6 drop-shadow-sm">
              "Fitgig made it so easy to start my fitness business. I booked my
              first class in minutes!"
            </blockquote>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-white/30">
                <img
                  alt="Profile picture of Elena"
                  className="h-full w-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkLoPj3E1Bx14q_mXy6yLeMVyrjz2lTE3gHNawI-yBSjGJEZiSJJ8HQHLKlt88AFsYQYtEus-Jya_py6c7hE5Gqj7dVsINFUU_Z4_cCoHHAnYA20vPc0gVf3vdGPIy85MQr9aTzNc3fm9VkzPGKnqd9R61b6hCbCPLgP5Pc9Fz5sgx8YeV5R8-EJgSqP9ddfEEUoWh3ksgGIXv9G4GvYLvPUS6XnBjTPKLAHLhu-_9k52R0i5QoD49WOhoXsdSt50wXlFh4g4c99o"
                />
              </div>
              <div>
                <p className="font-semibold text-white">Elena S.</p>
                <p className="text-sm text-white/80">
                  Pilates Instructor, Stockholm
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
