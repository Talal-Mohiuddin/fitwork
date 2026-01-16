import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, MessageSquare, Calendar, Settings, Users } from 'lucide-react';

interface NavRailProps {
  userType?: 'studio' | 'instructor';
  userName?: string;
  userAvatar?: string;
}

export default function NavRail({ userType = 'instructor', userName, userAvatar }: NavRailProps) {
  const dashboardLink = userType === 'studio' ? '/dashboard/studio' : '/dashboard/instructor';
  
  return (
    <nav className="w-20 flex-shrink-0 flex flex-col items-center py-6 border-r border-gray-200 bg-white z-20">
      {/* Logo */}
      <Link href="/" className="mb-8 flex flex-col items-center gap-1">
        <div className="w-10 h-10 text-primary">
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
        <span className="text-[10px] font-bold text-primary">Fitgig</span>
      </Link>

      {/* Icons */}
      <div className="flex flex-col gap-2 w-full items-center flex-1">
        <NavButton
          icon={<LayoutDashboard size={22} />}
          label="Dashboard"
          href={dashboardLink}
        />
        <NavButton
          icon={<MessageSquare size={22} />}
          label="Messages"
          href="/chat"
          active
        />
        <NavButton
          icon={<Calendar size={22} />}
          label="Schedule"
          href={dashboardLink}
        />
        {userType === 'studio' && (
          <NavButton
            icon={<Users size={22} />}
            label="Instructors"
            href="/instructors"
          />
        )}
      </div>

      {/* Settings */}
      <NavButton
        icon={<Settings size={22} />}
        label="Settings"
        href={userType === 'studio' ? '/profile/studio' : '/profile/instructor'}
      />

      {/* User Profile */}
      <div className="mt-4 flex flex-col items-center">
        {userAvatar ? (
          <div
            className="w-10 h-10 rounded-full bg-cover bg-center border-2 border-gray-200"
            style={{ backgroundImage: `url(${userAvatar})` }}
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
            {userName?.charAt(0) || 'U'}
          </div>
        )}
        {userName && (
          <span className="text-[9px] text-gray-500 mt-1 text-center max-w-[60px] truncate">
            {userName}
          </span>
        )}
      </div>
    </nav>
  );
}

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

function NavButton({ icon, label, href, active }: NavButtonProps) {
  return (
    <Link
      href={href}
      className={`p-3 rounded-xl transition-all relative group ${
        active
          ? 'bg-primary text-white'
          : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'
      }`}
    >
      {icon}
      <span className="absolute left-14 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
        {label}
      </span>
    </Link>
  );
}
