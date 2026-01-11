'use client';

import React, { useMemo } from 'react';
import { Video, Image, FileText, MapPin, Award } from 'lucide-react';
import { Profile } from '@/types';
import Link from 'next/link';

interface ProfileHealthCardProps {
  profile?: Profile | null;
}

interface ProfileSuggestion {
  icon: React.ReactNode;
  title: string;
  description: string;
  completed: boolean;
  href: string;
}

export default function ProfileHealthCard({ profile }: ProfileHealthCardProps) {
  const suggestions = useMemo<ProfileSuggestion[]>(() => {
    if (!profile) return [];
    
    return [
      {
        icon: <Image size={20} className="text-primary mt-0.5 flex-shrink-0" />,
        title: 'Add profile photo',
        description: 'Profiles with photos get 3x more views',
        completed: !!(profile.images && profile.images.length > 0),
        href: '/profile-setup/instructor',
      },
      {
        icon: <FileText size={20} className="text-primary mt-0.5 flex-shrink-0" />,
        title: 'Complete your bio',
        description: 'Tell studios about yourself',
        completed: !!(profile.bio && profile.bio.length > 50),
        href: '/profile-setup/instructor',
      },
      {
        icon: <MapPin size={20} className="text-primary mt-0.5 flex-shrink-0" />,
        title: 'Add your location',
        description: 'Help studios find you nearby',
        completed: !!profile.location,
        href: '/profile-setup/instructor',
      },
      {
        icon: <Award size={20} className="text-primary mt-0.5 flex-shrink-0" />,
        title: 'Add certifications',
        description: 'Showcase your qualifications',
        completed: !!(profile.certifications && profile.certifications.length > 0),
        href: '/profile-setup/instructor',
      },
      {
        icon: <Video size={20} className="text-primary mt-0.5 flex-shrink-0" />,
        title: 'Add a video reel',
        description: 'Boost your visibility by 2x',
        completed: !!(profile.video_url),
        href: '/profile-setup/instructor',
      },
    ];
  }, [profile]);

  const completedCount = suggestions.filter(s => s.completed).length;
  const healthPercentage = suggestions.length > 0 
    ? Math.round((completedCount / suggestions.length) * 100) 
    : 0;
  
  const nextSuggestion = suggestions.find(s => !s.completed);

  return (
    <div className="bg-white dark:bg-[#1e293b] p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex gap-6 justify-between mb-3">
        <p className="text-slate-900 dark:text-white text-base font-bold leading-normal">
          Profile Health
        </p>
        <p className="text-primary text-sm font-bold leading-normal">{healthPercentage}%</p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 mb-4">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-500"
          style={{ width: `${healthPercentage}%` }}
        />
      </div>

      {/* Suggestion */}
      {nextSuggestion ? (
        <Link 
          href={nextSuggestion.href}
          className="flex gap-3 items-start p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          {nextSuggestion.icon}
          <div className="flex flex-col">
            <p className="text-slate-900 dark:text-white text-sm font-medium">
              {nextSuggestion.title}
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-xs">
              {nextSuggestion.description}
            </p>
          </div>
        </Link>
      ) : (
        <div className="flex gap-3 items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <Award size={20} className="text-green-600 dark:text-green-400" />
          <p className="text-green-700 dark:text-green-400 text-sm font-medium">
            Your profile is complete! 🎉
          </p>
        </div>
      )}
    </div>
  );
}
