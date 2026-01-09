"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import LoginAction, { GoogleLoginAction } from "../action";
import { useStore } from "@/store/zustand";
import { useAuth } from "@/store/firebase-auth-provider";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useStore();

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    try {
      setLoading(true);
      const result = await LoginAction(email, password);
      console.log("Login result:", result);
      if (result.success) {
        toast.success(result.message || "Login successful!");
        setUser(result.user);
        console.log("User set in store:", result.user);
        // router.push("/dashboard");
      }
    } catch (error: any) {
      const errorMessage = error.message || "Login failed";
      toast.error(errorMessage);
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
        toast.success(result.message || "Google login successful!");
        setUser(result.user);
        router.push("/dashboard");
      }
    } catch (error: any) {
      const errorMessage = error.message || "Google login failed";
      toast.error(errorMessage);
      console.error("Google login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center dark:bg-background-dark">
      <div className="flex w-full max-w-2xl flex-col justify-between bg-white dark:bg-background-dark px-6 py-8 sm:px-12 lg:px-16 rounded-lg">
        <div className="mx-auto flex w-full flex-col justify-center">
          <div className="mb-10">
            <h1 className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em] mb-3">
              Welcome back
            </h1>
            <p className="text-neutral-gray dark:text-slate-400 text-base font-normal leading-normal">
              Log in to manage your studio or find your next gig in minutes.
            </p>
          </div>
          <form
            className="flex flex-col gap-5"
            onSubmit={handleEmailPasswordLogin}
          >
            <div className="flex flex-col gap-2">
              <label className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal">
                Email address
              </label>
              <input
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 h-12 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-[15px] text-base font-normal leading-normal focus:outline-0 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 ease-in-out"
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
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 h-12 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-[15px] text-base font-normal leading-normal focus:outline-0 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 ease-in-out"
                placeholder="••••••••••••"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <button
              className="mt-2 flex h-12 w-full items-center justify-center rounded-lg bg-primary px-6 text-base font-bold text-white shadow-md shadow-primary/10 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Or continue with
            </span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="mt-6 flex h-12 w-full items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 text-base font-semibold text-slate-900 dark:text-white shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed gap-2 flex-wrap"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>{loading ? "Signing in..." : "Sign in with Google"}</span>
          </button>

          <div className="mt-8 text-center">
            <p className="text-neutral-gray dark:text-slate-400 text-sm font-normal">
              New to Fitgig?{" "}
              <a
                className="text-primary font-semibold hover:text-primary-hover hover:underline"
                href="/signup"
              >
                Create an account
              </a>
            </p>
          </div>
        </div>
        <footer className="text-xs text-slate-400 dark:text-slate-600">
          © 2024 Fitgig Platform.
        </footer>
      </div>
    </div>
  );
};

export default LoginForm;
