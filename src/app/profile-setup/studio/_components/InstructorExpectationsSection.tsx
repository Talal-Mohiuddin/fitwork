import React, { useState } from 'react';
import { Headphones, Users, GraduationCap, Radio } from 'lucide-react';
import { Profile } from '@/types';

interface InstructorExpectationsSectionProps {
  profile: Partial<Profile>;
  onChange: (updates: Partial<Profile>) => void;
}

export default function InstructorExpectationsSection({
  profile,
  onChange,
}: InstructorExpectationsSectionProps) {
  const [musicPolicy, setMusicPolicy] = useState('instructor');
  const [techEquipment, setTechEquipment] = useState(['Headset Mic', 'iPad / Tablet']);
  const [requirements, setRequirements] = useState({
    audition: true,
    training: false,
  });

  const toggleTechEquipment = (item: string) => {
    setTechEquipment(prev =>
      prev.includes(item)
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  return (
    <section className="p-8 scroll-mt-24" id="expectations">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-text-main dark:text-white">
        <Headphones size={20} className="text-primary" />
        Instructor Experience
      </h2>

      <div className="space-y-8">
        {/* Music Policy */}
        <div>
          <label className="block text-sm font-medium mb-3 text-text-main dark:text-white">
            Music Policy
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { id: 'instructor', label: 'Instructor Choice', desc: "Instructors curate their own playlists.", icon: <Radio size={16} /> },
              { id: 'studio', label: 'Studio Playlist', desc: "Pre-approved or studio-provided music.", icon: <Radio size={16} /> },
              { id: 'mixed', label: 'Mixed Model', desc: "Guidelines provided, with some freedom.", icon: <Radio size={16} /> },
            ].map(option => (
              <div key={option.id} className="relative">
                <input
                  checked={musicPolicy === option.id}
                  onChange={() => setMusicPolicy(option.id)}
                  className="peer hidden"
                  id={option.id}
                  name="music_policy"
                  type="radio"
                />
                <label
                  className="block cursor-pointer p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-background-light dark:bg-[#15241b] peer-checked:border-primary peer-checked:ring-1 peer-checked:ring-primary transition-all"
                  htmlFor={option.id}
                >
                  <div className="font-bold text-sm mb-1 text-text-main dark:text-white">
                    {option.label}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{option.desc}</p>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Equipment */}
        <div>
          <label className="block text-sm font-medium mb-3 text-text-main dark:text-white">
            Tech & Equipment Provided
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['Headset Mic', 'Handheld Mic', 'iPad / Tablet', 'Bluetooth'].map(item => (
              <label key={item} className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-[#15241b] border border-transparent hover:border-gray-300 dark:hover:border-gray-600 cursor-pointer transition-all">
                <input
                  checked={techEquipment.includes(item)}
                  onChange={() => toggleTechEquipment(item)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                  type="checkbox"
                />
                <span className="text-sm text-text-main dark:text-white">{item}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Onboarding Requirements */}
        <div>
          <label className="block text-sm font-medium mb-3 text-text-main dark:text-white">
            Onboarding Requirements
          </label>
          <div className="flex flex-col gap-2">
            <label className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#15241b]">
              <div className="flex items-center gap-3">
                <Users size={20} className="text-gray-400" />
                <div>
                  <span className="block text-sm font-medium text-text-main dark:text-white">Audition Required</span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400">
                    Do instructors need to demo a class?
                  </span>
                </div>
              </div>
              <div className="relative inline-flex items-center cursor-pointer">
                <input
                  checked={requirements.audition}
                  onChange={(e) => setRequirements({ ...requirements, audition: e.target.checked })}
                  className="sr-only peer"
                  type="checkbox"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </div>
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#15241b]">
              <div className="flex items-center gap-3">
                <GraduationCap size={20} className="text-gray-400" />
                <div>
                  <span className="block text-sm font-medium text-text-main dark:text-white">Paid Training</span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400">
                    Is initial training compensated?
                  </span>
                </div>
              </div>
              <div className="relative inline-flex items-center cursor-pointer">
                <input
                  checked={requirements.training}
                  onChange={(e) => setRequirements({ ...requirements, training: e.target.checked })}
                  className="sr-only peer"
                  type="checkbox"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </div>
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}
