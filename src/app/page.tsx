"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";
import Image from "next/image";
import HeroSection from "./_components/hero-section";
import TrustedBySection from "./_components/trusted-by";
import StudioPanel from "./_components/studio-panel";
import IdealSection from "./_components/ideal-section";
import PostJobSection from "./_components/post-job";
import { getStudioById } from "@/services/studioService";
import { Loader2 } from "lucide-react";
import { Profile } from "@/types";
import Link from "next/link";

interface HeroProps {
  isLoggedIn: boolean;
  userType?: string;
}

function DashboardHero({ isLoggedIn, userType }: HeroProps) {
  return null;
}

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userProfile = await getStudioById(currentUser.uid);
          setProfile(userProfile);
        } catch (error) {
          console.error("Error loading profile:", error);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Always show hero section
  return (
    <>
      {/* Update HeroSection to accept isLoggedIn prop */}
      <HeroSection isLoggedIn={!!user} />
      <TrustedBySection />
      
      {/* Show dashboard quick links only for logged-in users */}
      {user && profile && (
        <section className="bg-background-light dark:bg-background-dark py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-text-main dark:text-white mb-4">
                {profile.user_type === "studio"
                  ? `Welcome back, ${profile.name || "Studio"}!`
                  : `Welcome back, ${profile.full_name || "Instructor"}!`}
              </h2>
              <p className="text-lg text-text-muted">
                {profile.user_type === "studio"
                  ? "Manage your studio, post jobs, and connect with talent"
                  : "Discover gigs, manage applications, and grow your career"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {profile.user_type === "studio" ? (
                <>
                  <Link href="/dashboard/studio" className="block">
                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-8 border border-border-light dark:border-border-dark hover:border-primary transition-all hover:shadow-lg">
                      <div className="text-4xl mb-4">📊</div>
                      <h3 className="text-xl font-bold text-text-main dark:text-white mb-2">
                        Dashboard
                      </h3>
                      <p className="text-text-muted">View analytics and manage your studio</p>
                    </div>
                  </Link>
                  <Link href="/jobs/post" className="block">
                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-8 border border-border-light dark:border-border-dark hover:border-primary transition-all hover:shadow-lg">
                      <div className="text-4xl mb-4">💼</div>
                      <h3 className="text-xl font-bold text-text-main dark:text-white mb-2">
                        Post a Job
                      </h3>
                      <p className="text-text-muted">Reach thousands of qualified instructors</p>
                    </div>
                  </Link>
                  <Link href="/instructors" className="block">
                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-8 border border-border-light dark:border-border-dark hover:border-primary transition-all hover:shadow-lg">
                      <div className="text-4xl mb-4">👥</div>
                      <h3 className="text-xl font-bold text-text-main dark:text-white mb-2">
                        Find Talent
                      </h3>
                      <p className="text-text-muted">Browse and invite certified instructors</p>
                    </div>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/jobs" className="block">
                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-8 border border-border-light dark:border-border-dark hover:border-primary transition-all hover:shadow-lg">
                      <div className="text-4xl mb-4">🎯</div>
                      <h3 className="text-xl font-bold text-text-main dark:text-white mb-2">
                        Browse Jobs
                      </h3>
                      <p className="text-text-muted">Find gigs tailored to your expertise</p>
                    </div>
                  </Link>
                  <Link href="/dashboard/instructor" className="block">
                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-8 border border-border-light dark:border-border-dark hover:border-primary transition-all hover:shadow-lg">
                      <div className="text-4xl mb-4">📋</div>
                      <h3 className="text-xl font-bold text-text-main dark:text-white mb-2">
                        My Applications
                      </h3>
                      <p className="text-text-muted">Track your job applications and offers</p>
                    </div>
                  </Link>
                  <Link href="/guest-spots" className="block">
                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-8 border border-border-light dark:border-border-dark hover:border-primary transition-all hover:shadow-lg">
                      <div className="text-4xl mb-4">✈️</div>
                      <h3 className="text-xl font-bold text-text-main dark:text-white mb-2">
                        Guest Spots
                      </h3>
                      <p className="text-text-muted">Teach at studios around the world</p>
                    </div>
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>
      )}
      
      <StudioPanel />
      <IdealSection />
      {!user && <PostJobSection />}
    </>
  );
}
