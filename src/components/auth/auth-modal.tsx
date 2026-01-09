"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Building, Dumbbell } from "lucide-react";
import { sendMagicLinkAction, signInWithGoogleAction } from "@/app/auth-actions";
import { useStore } from "@/store/zustand";
import { useRouter } from "next/navigation";
import { signInWithPopup, sendSignInLinkToEmail } from "firebase/auth";
import { auth, googleProvider } from "@/firebase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "register";
}

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

const FitgigLogo = () => (
  <div className="flex items-center justify-center mb-6">
    <div className="w-16 h-16 text-[#21c55e]">
      <svg
        className="w-full h-full"
        fill="none"
        viewBox="0 0 48 48"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Shopping bag outline */}
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
        {/* F letter in white */}
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
);

export default function AuthModal({ isOpen, onClose, defaultTab = "login" }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">(defaultTab);
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState<"instructor" | "studio">("instructor");
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const { setUser } = useStore();
  const router = useRouter();

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    try {
      setLoading(true);
      
      // First, store registration data on server if registering
      const result = await sendMagicLinkAction(
        email,
        activeTab === "register" ? userType : undefined,
        activeTab
      );

      if (!result.success) {
        toast.error(result.message || "Failed to process request");
        return;
      }

      // Send magic link using Firebase client SDK
      const actionCodeSettings = {
        url: `${window.location.origin}/login/action?email=${encodeURIComponent(email)}${activeTab === "register" ? `&userType=${userType}` : ""}`,
        handleCodeInApp: true,
      };

      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      
      // Store email in localStorage to complete sign-in after redirect
      window.localStorage.setItem("emailForSignIn", email);
      if (activeTab === "register") {
        window.localStorage.setItem("userTypeForSignIn", userType);
      }

      setMagicLinkSent(true);
      toast.success("Check your email for the magic link!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      toast.error(errorMessage);
      console.error("Magic link error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      
      // Google sign-in must happen on client side
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Call server action to create/get profile
      const serverResult = await signInWithGoogleAction(
        user.uid,
        user.email || "",
        user.displayName || "",
        activeTab === "register" ? userType : undefined
      );

      if (serverResult.success) {
        toast.success(activeTab === "register" ? "Account created!" : "Signed in successfully!");
        setUser(serverResult.user);
        onClose();
        
        // Redirect based on profile completion
        if (serverResult.user?.profile_completed) {
          router.push(`/dashboard/${serverResult.user.user_type}`);
        } else if (serverResult.isNewUser) {
          router.push(`/profile-setup/${serverResult.user?.user_type}`);
        } else {
          router.push(`/dashboard/${serverResult.user?.user_type}`);
        }
      } else {
        toast.error(serverResult.message || "Failed to sign in");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Google sign-in failed";
      toast.error(errorMessage);
      console.error("Google sign-in error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMagicLinkSent(false);
    setEmail("");
    onClose();
  };

  if (magicLinkSent) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 p-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-[#21c55e]/10 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-[#21c55e]" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Check your email
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              We sent a magic link to <span className="font-semibold text-slate-700 dark:text-slate-300">{email}</span>. 
              Click the link to {activeTab === "register" ? "create your account" : "sign in"}.
            </p>
            <button
              onClick={handleClose}
              className="text-[#21c55e] hover:underline text-sm font-medium"
            >
              Back to sign in
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 p-8">
        <FitgigLogo />
        
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "register")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <TabsTrigger 
              value="login" 
              className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm py-2"
            >
              Login
            </TabsTrigger>
            <TabsTrigger 
              value="register" 
              className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm py-2"
            >
              Register
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-6">
            <form onSubmit={handleSendMagicLink} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900 dark:text-slate-200">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#21c55e]/20 focus:border-[#21c55e] transition-all"
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#21c55e] hover:bg-[#1ea853] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Send Magic Link"}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-slate-900 px-2 text-slate-500 dark:text-slate-400">
                    Or continue with
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3 flex items-center justify-center gap-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <GoogleIcon />
                <span className="text-slate-700 dark:text-slate-200 font-medium">Sign in with Google</span>
              </button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="mt-6">
            <form onSubmit={handleSendMagicLink} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900 dark:text-slate-200">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#21c55e]/20 focus:border-[#21c55e] transition-all"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900 dark:text-slate-200">
                  User Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setUserType("instructor")}
                    className={`flex items-center justify-center gap-2 py-3 rounded-lg border-2 transition-all ${
                      userType === "instructor"
                        ? "border-[#21c55e] bg-[#21c55e] text-white"
                        : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <Dumbbell className="w-5 h-5" />
                    <span className="font-medium">Instructor</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType("studio")}
                    className={`flex items-center justify-center gap-2 py-3 rounded-lg border-2 transition-all ${
                      userType === "studio"
                        ? "border-[#21c55e] bg-[#21c55e] text-white"
                        : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <Building className="w-5 h-5" />
                    <span className="font-medium">Studio</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#21c55e] hover:bg-[#1ea853] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Send Magic Link"}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-slate-900 px-2 text-slate-500 dark:text-slate-400">
                    Or continue with
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3 flex items-center justify-center gap-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <GoogleIcon />
                <span className="text-slate-700 dark:text-slate-200 font-medium">Sign up with Google</span>
              </button>

              <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setActiveTab("login")}
                  className="text-[#21c55e] hover:underline font-medium"
                >
                  Log in
                </button>
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
