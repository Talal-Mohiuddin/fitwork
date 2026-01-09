import React, { useState } from 'react';
import { Trash2, Briefcase } from 'lucide-react';
import { Profile, Experience } from '@/types';

interface ExperienceSectionProps {
  profile: Partial<Profile>;
  onChange: (updates: Partial<Profile>) => void;
}

export default function ExperienceSection({ profile, onChange }: ExperienceSectionProps) {
  const experiences = profile.experience || [];
  const [newExp, setNewExp] = useState({ company: '', title: '', startYear: '', endYear: '' });

  const handleAddExperience = () => {
    if (newExp.company && newExp.title && newExp.startYear) {
      const experience: Experience = {
        company: newExp.company,
        title: newExp.title,
        period: `${newExp.startYear}${newExp.endYear ? ` - ${newExp.endYear}` : ' - Present'}`,
        isActive: !newExp.endYear,
      };
      onChange({ experience: [...experiences, experience] });
      setNewExp({ company: '', title: '', startYear: '', endYear: '' });
    }
  };

  const handleDeleteExperience = (index: number) => {
    onChange({ experience: experiences.filter((_, i) => i !== index) });
  };

  return (
    <section className="scroll-mt-24" id="experience">
      <h2 className="text-2xl font-display font-bold text-text-main dark:text-white mb-6 flex items-center gap-3">
        <span className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm">2</span>
        Work Experience
      </h2>

      <div className="rounded-2xl border border-gray-200 bg-surface-light dark:bg-surface-dark dark:border-gray-800 p-8 shadow-sm">
        <div className="mb-6 flex flex-col gap-4">
          {/* ...existing code... */}
          {experiences.map((exp, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 group">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-gray-700 shadow-sm border border-gray-100 dark:border-gray-600">
                  <Briefcase size={20} className="text-text-secondary" />
                </div>
                <div>
                  <h4 className="font-bold text-text-main dark:text-white">{exp.title} @ {exp.company}</h4>
                  <p className="text-sm text-text-secondary">{exp.period}</p>
                </div>
              </div>
              <button
                onClick={() => handleDeleteExperience(idx)}
                className="opacity-0 group-hover:opacity-100 p-2 text-text-secondary hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                type="button"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}

          <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
            <h4 className="text-sm font-bold text-text-main dark:text-white mb-4">Add Role</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <input
                type="text"
                placeholder="Studio Name"
                value={newExp.company}
                onChange={(e) => setNewExp({ ...newExp, company: e.target.value })}
                className="rounded-lg border-gray-200 bg-white px-4 py-3 text-sm text-text-main placeholder-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              <input
                type="text"
                placeholder="Role / Title"
                value={newExp.title}
                onChange={(e) => setNewExp({ ...newExp, title: e.target.value })}
                className="rounded-lg border-gray-200 bg-white px-4 py-3 text-sm text-text-main placeholder-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              <div className="flex gap-4 md:col-span-2">
                <div className="flex-1 flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Start Year"
                    value={newExp.startYear}
                    onChange={(e) => setNewExp({ ...newExp, startYear: e.target.value })}
                    className="w-full rounded-lg border-gray-200 bg-white px-4 py-3 text-sm text-text-main placeholder-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                  <span className="text-gray-300">-</span>
                  <input
                    type="text"
                    placeholder="End Year"
                    value={newExp.endYear}
                    onChange={(e) => setNewExp({ ...newExp, endYear: e.target.value })}
                    className="w-full rounded-lg border-gray-200 bg-white px-4 py-3 text-sm text-text-main placeholder-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                <button
                  onClick={handleAddExperience}
                  className="shrink-0 rounded-lg bg-text-main dark:bg-white px-6 py-3 text-sm font-bold text-white dark:text-black hover:opacity-90 transition-opacity"
                  type="button"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
