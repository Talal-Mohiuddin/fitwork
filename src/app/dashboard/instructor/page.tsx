'use client';

import React from 'react';
import { LayoutDashboard, Search, Calendar, User, DollarSign, Menu } from 'lucide-react';
import Sidebar from './_components/Sidebar';
import Header from './_components/Header';
import StatsSection from './_components/StatsSection';
import ScheduleSection from './_components/ScheduleSection';
import RecommendedSection from './_components/RecommendedSection';
import ProfileHealthCard from './_components/ProfileHealthCard';
import ApplicationsTimeline from './_components/ApplicationsTimeline';
import AvailabilityCard from './_components/AvailabilityCard';
import { useAuth } from '@/store/firebase-auth-provider';
import { RequireProfile } from '@/components/auth';

export default function InstructorDashboard() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const { user, profile } = useAuth();

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', href: '/dashboard/instructor', active: true },
    { icon: <Search size={20} />, label: 'Find Gigs', href: '/jobs', active: false },
    { icon: <Calendar size={20} />, label: 'Schedule', href: '#', active: false },
    { icon: <User size={20} />, label: 'My Profile', href: '/profile/instructor', active: false },
    { icon: <DollarSign size={20} />, label: 'Earnings', href: '#', active: false },
  ];

  return (
    <RequireProfile userType="instructor">
      <div className="flex h-screen max-w-7xl mx-auto bg-background-light dark:bg-background-dark">
        {/* Sidebar */}
        <Sidebar navItems={navItems} />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
          <div className="max-w-[1200px] mx-auto p-6 md:p-8 lg:p-12 flex flex-col lg:flex-row gap-8">
            {/* Left Column */}
            <div className="flex-1 flex flex-col gap-8 min-w-0">
              {/* Header */}
              <Header userName={profile?.full_name || user?.displayName || 'Instructor'} />

              {/* Stats Section */}
              <StatsSection userId={user?.uid} />

              {/* Today's Schedule */}
              <ScheduleSection />

              {/* Recommended Section */}
              <RecommendedSection 
                userId={user?.uid} 
                userStyles={profile?.fitness_styles || []} 
              />
            </div>

            {/* Right Sidebar */}
            <aside className="w-full lg:w-80 flex flex-col gap-6 flex-shrink-0">
              <ProfileHealthCard profile={profile} />
              <ApplicationsTimeline userId={user?.uid} />
              <AvailabilityCard />
            </aside>
          </div>
        </main>
      </div>
    </RequireProfile>
  );
}
