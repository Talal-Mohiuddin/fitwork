"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Search, Users, Building, LogOut, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import AuthModal from "./auth/auth-modal";
import { useStore } from "@/store/zustand";
import { useAuth } from "@/store/firebase-auth-provider";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase";
import { toast } from "sonner";
import type { Profile } from "@/types";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");
  const router = useRouter();
  const { user, setUser } = useStore();
  const { user: firebaseUser } = useAuth();

  const openAuthModal = (tab: "login" | "register") => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      toast.success("Signed out successfully");
      router.push("/");
    } catch {
      toast.error("Failed to sign out");
    }
  };

  const isLoggedIn = !!user || !!firebaseUser;
  const userProfile = user as Profile | null;

  const getProfileLink = () => {
    if (userProfile?.user_type === "studio") {
      return "/profile/studio";
    }
    return "/profile/instructor";
  };

  return (
    <header className="w-full bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-0 h-[72px] flex items-center justify-between">
        {/* Logo and Title */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => (window.location.href = "/")}
        >
          <div className="w-8 h-8 text-[#21c55e]">
            <svg
              className="w-full h-full"
              fill="none"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                clipRule="evenodd"
                d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z"
                fill="currentColor"
                fillRule="evenodd"
              ></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#21c55e]">
            Fitgig
          </h2>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6 ">
          <Link
            href="/jobs"
            className="flex flex-col items-center text-gray-500 hover:text-gray-800 transition-colors"
          >
            <Search className="w-6 h-6 " />
            <span className="text-sm">Jobs</span>
          </Link>
          <Link
            href="/instructors"
            className="flex flex-col items-center text-gray-500 hover:text-gray-800 transition-colors"
          >
            <Users className="w-6 h-6 " />
            <span className="text-sm">Talent</span>
          </Link>
          <Link
            href="/studios"
            className="flex border-r-2 pr-4 flex-col items-center text-gray-500 hover:text-gray-800 transition-colors"
          >
            <Building className="w-6 h-6 " />
            <span className="text-sm">Studios</span>
          </Link>
          
          {isLoggedIn ? (
            <>
              <button
                onClick={() => router.push(getProfileLink())}
                className="flex flex-col items-center text-gray-500 hover:text-gray-800 transition-colors"
              >
                <UserCircle className="w-6 h-6" />
                <span className="text-sm">Profile</span>
              </button>
              <button
                onClick={() => router.push(`/dashboard/${userProfile?.user_type || 'instructor'}`)}
                className="text-gray-500 hover:text-gray-800 text-sm font-semibold px-4 transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={handleSignOut}
                className="text-red-500 hover:text-red-600 flex items-center gap-1 text-sm font-semibold px-4 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => openAuthModal("register")}
                className="text-gray-500 hover:text-gray-800 text-sm font-semibold px-4 transition-colors"
              >
                Join now
              </button>
              <button 
                onClick={() => openAuthModal("login")}
                className="text-[#21c55e] hover:text-white border border-[#21c55e] hover:bg-[#21c55e] rounded-full text-sm font-semibold px-6 py-2 transition-all"
              >
                Sign in
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-800 hover:text-[#21c55e] focus:outline-none"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800">
          <div className="space-y-4 py-4">
            <Link
              href="/jobs"
              className="flex flex-col items-center text-gray-800 hover:text-[#21c55e]"
            >
              <Search className="w-6 h-6" />
              <span className="text-sm">Jobs</span>
            </Link>
            <Link
              href="/instructors"
              className="flex flex-col items-center text-gray-800 hover:text-[#21c55e]"
            >
              <Users className="w-6 h-6" />
              <span className="text-sm">Talent</span>
            </Link>
            <Link
              href="/studios"
              className="flex flex-col items-center text-gray-800 hover:text-[#21c55e]"
            >
              <Building className="w-6 h-6" />
              <span className="text-sm">Studios</span>
            </Link>
          </div>
          <div className="border-t border-gray-200 dark:border-slate-800 py-4">
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => {
                    router.push(getProfileLink());
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-800 hover:text-[#21c55e]"
                >
                  My Profile
                </button>
                <button
                  onClick={() => {
                    router.push(`/dashboard/${userProfile?.user_type || 'instructor'}`);
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-800 hover:text-[#21c55e]"
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-red-500 hover:text-red-600"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    openAuthModal("register");
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-800 hover:text-[#21c55e]"
                >
                  Join now
                </button>
                <button 
                  onClick={() => {
                    openAuthModal("login");
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-[#21c55e] hover:bg-[#21c55e] hover:text-white"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        defaultTab={authModalTab}
      />
    </header>
  );
}
