"use client";

import React, { useState } from "react";
import {
  Dumbbell,
  Bell,
  Plus,
  AlertCircle,
  Users,
  Briefcase,
  Clock,
} from "lucide-react";
import Header from "./_components/Header";
import StatsCards from "./_components/StatsCards";
import OpenShiftsSection from "./_components/OpenShiftsSection";
import PendingApplicationsSection from "./_components/PendingApplicationsSection";
import YourBenchSection from "./_components/YourBenchSection";
import { useAuth } from '@/store/firebase-auth-provider';
import Link from "next/link";

export default function StudioDashboard() {
  const [notifications, setNotifications] = useState(true);
  const { user, profile } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark max-w-7xl mx-auto">

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-4xl font-black text-text-main dark:text-white tracking-tight">
              {getGreeting()}, {profile?.name || 'Studio'}
            </h1>
            <p className="text-text-sub dark:text-gray-400 text-base">
              Here's the latest status of your {profile?.location || 'studio'} operations.
            </p>
          </div>
          <Link 
            href="/jobs/post"
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-md shadow-primary/20 w-fit"
          >
            <Plus size={20} />
            <span>Post a Cover Gig</span>
          </Link>
        </div>

        {/* Stats Cards */}
        <StatsCards studioId={user?.uid} />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* Open Shifts */}
            <OpenShiftsSection studioId={user?.uid} />

            {/* Pending Applications */}
            <PendingApplicationsSection studioId={user?.uid} />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4">
            <YourBenchSection studioId={user?.uid} />
          </div>
        </div>
      </main>
    </div>
  );
}
