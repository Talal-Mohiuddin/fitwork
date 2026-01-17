"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase";
import Image from "next/image";
import HeroSection from "./_components/hero-section";
import TrustedBySection from "./_components/trusted-by";
import IdealSection from "./_components/ideal-section";
import PostJobSection from "./_components/post-job";
import { getStudioById, getStudios } from "@/services/studioService";
import { getInstructorProfile } from "@/services/instructorProfileService";
import { Loader2, MapPin, BarChart3, Briefcase, Users, Target, Clipboard, Building } from "lucide-react";
import { Profile } from "@/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [studios, setStudios] = useState<Profile[]>([]);

  useEffect(() => {
    // Fetch top studios
    getStudios({ limitCount: 4 }).then(({ studios }) => {
      setStudios(studios);
    }).catch(err => console.error("Error fetching studios:", err));

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          // Try to get studio profile first
          let userProfile = await getStudioById(currentUser.uid);
          
          // If not found, try instructor profile
          if (!userProfile) {
            userProfile = await getInstructorProfile(currentUser.uid);
          }
          
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
      {/* Connect with top studios section */}
      <section className="bg-white dark:bg-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="text-3xl font-light text-slate-900 dark:text-white mb-2">
              Connect with top studios
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              Studios actively hiring in your area.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {studios.length > 0 ? (
              studios.map((studio) => (
                <div key={studio.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                  <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-700 mb-4 overflow-hidden relative">
                    {studio.images?.[0] ? (
                      <Image src={studio.images[0]} alt={studio.name || 'Studio'} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-slate-400">
                        {studio.name?.charAt(0) || "S"}
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">
                    {studio.name}
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-slate-500 mb-4">
                    <MapPin className="w-4 h-4" />
                    <span>{studio.location || "Location N/A"}</span>
                  </div>
                  <Link href={`/studios/${studio.id}`} className="w-full">
                    <Button variant="outline" className="w-full rounded-full border-green-500 text-green-600 hover:bg-green-50">
                      View Studio
                    </Button>
                  </Link>
                </div>
              ))
             ) : (
              <div className="col-span-full text-center py-10 text-slate-500">
                No studios found.
              </div>
            )}
          </div>
          
          <div className="mt-8">
             <Link href="/studios" className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white hover:underline">
               View all studios &rarr;
             </Link>
          </div>
        </div>
      </section>

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
                      <BarChart3 className="w-16 h-16 mb-4 text-primary" />
                      <h3 className="text-xl font-bold text-text-main dark:text-white mb-2">
                        Dashboard
                      </h3>
                      <p className="text-text-muted">View analytics and manage your studio</p>
                    </div>
                  </Link>
                  <Link href="/jobs/post/wizard" className="block">
                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-8 border border-border-light dark:border-border-dark hover:border-primary transition-all hover:shadow-lg">
                      <Briefcase className="w-16 h-16 mb-4 text-primary" />
                      <h3 className="text-xl font-bold text-text-main dark:text-white mb-2">
                        Post a Job
                      </h3>
                      <p className="text-text-muted">Reach thousands of qualified instructors</p>
                    </div>
                  </Link>
                  <Link href="/instructors" className="block">
                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-8 border border-border-light dark:border-border-dark hover:border-primary transition-all hover:shadow-lg">
                      <Users className="w-16 h-16 mb-4 text-primary" />
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
                      <Target className="w-16 h-16 mb-4 text-primary" />
                      <h3 className="text-xl font-bold text-text-main dark:text-white mb-2">
                        Browse Jobs
                      </h3>
                      <p className="text-text-muted">Find gigs tailored to your expertise</p>
                    </div>
                  </Link>
                  <Link href="/dashboard/instructor" className="block">
                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-8 border border-border-light dark:border-border-dark hover:border-primary transition-all hover:shadow-lg">
                      <Clipboard className="w-16 h-16 mb-4 text-primary" />
                      <h3 className="text-xl font-bold text-text-main dark:text-white mb-2">
                        Dashboard
                      </h3>
                      <p className="text-text-muted">Manage your career and applications</p>
                    </div>
                  </Link>
                  <Link href="/studios" className="block">
                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-8 border border-border-light dark:border-border-dark hover:border-primary transition-all hover:shadow-lg">
                      <Building className="w-16 h-16 mb-4 text-primary" />
                      <h3 className="text-xl font-bold text-text-main dark:text-white mb-2">
                        Browse Studios
                      </h3>
                      <p className="text-text-muted">Explore studios and opportunities</p>
                    </div>
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>
      )}
      
      <IdealSection />
      {!user && <PostJobSection />}
    </>
  );
}
