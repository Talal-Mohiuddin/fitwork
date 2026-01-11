'use client';

import React, { useEffect, useState } from 'react';
import { Send, Search, Loader2, UserPlus } from 'lucide-react';
import { getSavedProfiles } from '@/services/talentService';
import { Profile } from '@/types';
import Link from 'next/link';

interface YourBenchSectionProps {
  studioId?: string;
}

export default function YourBenchSection({ studioId }: YourBenchSectionProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [bench, setBench] = useState<Profile[]>([]);

  useEffect(() => {
    if (studioId) {
      loadBench();
    }
  }, [studioId]);

  const loadBench = async () => {
    if (!studioId) return;
    
    try {
      setIsLoading(true);
      const savedProfiles = await getSavedProfiles(studioId);
      setBench(savedProfiles);
    } catch (error) {
      console.error('Error loading bench:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm h-full max-h-[600px] flex flex-col">
      <div className="px-6 py-5 border-b border-border-light dark:border-border-dark">
        <h2 className="text-lg font-bold text-text-main dark:text-white">
          Your Bench
        </h2>
        <p className="text-sm text-text-sub">
          Quickly book your favorite instructors.
        </p>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : bench.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <UserPlus className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-text-sub dark:text-gray-400 text-sm mb-2">No instructors saved yet</p>
          <Link 
            href="/instructors" 
            className="text-primary text-sm font-medium hover:underline"
          >
            Browse talent to add to your bench
          </Link>
        </div>
      ) : (
        <>
          {/* Instructors List */}
          <div className="p-4 flex flex-col gap-3 overflow-y-auto flex-1">
            {bench.map((instructor) => (
              <Link
                key={instructor.id}
                href={`/instructors/${instructor.id}`}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div
                      className="size-10 rounded-full bg-cover bg-center bg-primary/10 flex items-center justify-center"
                      style={instructor.images?.[0] ? { backgroundImage: `url(${instructor.images[0]})` } : {}}
                    >
                      {!instructor.images?.[0] && (
                        <span className="text-primary font-bold text-sm">
                          {instructor.full_name?.charAt(0) || 'U'}
                        </span>
                      )}
                    </div>
                    <span
                      className={`absolute bottom-0 right-0 size-2.5 border-2 border-white dark:border-gray-800 rounded-full ${
                        instructor.available !== false ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-main dark:text-white">
                      {instructor.full_name || 'Instructor'}
                    </p>
                    <p className="text-xs text-text-sub">
                      {instructor.fitness_styles?.slice(0, 2).join(', ') || 'Fitness Instructor'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    // TODO: Implement quick message feature
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-primary/10 hover:bg-primary/20 text-primary rounded p-1.5"
                >
                  <Send size={20} />
                </button>
              </Link>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border-light dark:border-border-dark">
            <Link 
              href="/instructors"
              className="w-full flex items-center justify-center gap-2 text-sm font-medium text-primary hover:bg-primary/5 py-2 rounded-lg transition-colors"
            >
              <Search size={18} />
              Find new talent
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
