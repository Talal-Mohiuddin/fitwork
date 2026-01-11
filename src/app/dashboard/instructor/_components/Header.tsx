'use client';

import React from 'react';
import Link from 'next/link';
import { Edit3 } from 'lucide-react';

interface HeaderProps {
  userName?: string;
}

export default function Header({ userName = 'Instructor' }: HeaderProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="flex flex-col gap-2 pt-2">
      <div className="flex items-center justify-between">
        <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
          {getGreeting()}, {userName.split(' ')[0]}
        </h1>
        <Link 
          href="/profile-setup/instructor"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 rounded-lg transition-colors"
        >
          <Edit3 size={16} />
          Edit Profile
        </Link>
      </div>
      <p className="text-slate-500 dark:text-slate-400 text-base font-normal">
        Ready to find your next opportunity? Let's make it count.
      </p>
    </header>
  );
}
