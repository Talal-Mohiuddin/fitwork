import React, { useState } from 'react';
import { Edit, MapPin, Camera } from 'lucide-react';
import { Profile } from '@/types';

interface BasicsSectionProps {
  profile: Partial<Profile>;
  onChange: (updates: Partial<Profile>) => void;
}

export default function BasicsSection({ profile, onChange }: BasicsSectionProps) {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState(profile.profile_photo || '');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const preview = event.target?.result as string;
        setPhotoPreview(preview);
        onChange({ profile_photo: preview });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field: keyof Profile, value: any) => {
    onChange({ [field]: value } as Partial<Profile>);
  };

  return (
    <section className="scroll-mt-24" id="basics">
      <h2 className="text-2xl font-display font-bold text-text-main dark:text-white mb-6 flex items-center gap-3">
        <span className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/20 text-primary-dark dark:text-primary text-sm">1</span>
        The Basics
      </h2>

      <div className="rounded-2xl border border-gray-200 bg-surface-light dark:bg-surface-dark dark:border-gray-800 p-8 shadow-sm">
        {/* Photo & Basic Info */}
        <div className="flex flex-col md:flex-row gap-8 mb-8 pb-8 border-b border-gray-100 dark:border-gray-800">
          {/* Photo Upload */}
          <div className="shrink-0 flex flex-col items-center gap-3">
            <div className="relative group cursor-pointer">
              <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-primary/20 bg-gray-100 dark:bg-gray-700 shadow-md">
                <div 
                  className="h-full w-full bg-cover bg-center transition-opacity group-hover:opacity-75"
                  style={{ backgroundImage: photoPreview ? `url(${photoPreview})` : 'none' }}
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100 bg-black/30">
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <Edit size={24} className="text-white" />
                </label>
              </div>
              <label htmlFor="photo-upload" className="absolute bottom-1 right-1 h-8 w-8 rounded-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 flex items-center justify-center text-primary shadow-sm cursor-pointer">
                <Camera size={18} />
              </label>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>
            <p className="text-xs font-medium text-text-secondary">Max 5MB</p>
          </div>

          {/* Text Inputs */}
          <div className="flex-1 grid gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-text-main dark:text-gray-300">First Name</label>
                <input
                  type="text"
                  value={profile.full_name?.split(' ')[0] || 'Alex'}
                  onChange={(e) => {
                    const lastName = profile.full_name?.split(' ')[1] || 'Morgan';
                    handleInputChange('full_name', `${e.target.value} ${lastName}`);
                  }}
                  className="w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-3 text-text-main placeholder-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-text-main dark:text-gray-300">Last Name</label>
                <input
                  type="text"
                  value={profile.full_name?.split(' ')[1] || 'Morgan'}
                  onChange={(e) => {
                    const firstName = profile.full_name?.split(' ')[0] || 'Alex';
                    handleInputChange('full_name', `${firstName} ${e.target.value}`);
                  }}
                  className="w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-3 text-text-main placeholder-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-text-main dark:text-gray-300">
                Profile Headline <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                value={profile.headline || ''}
                onChange={(e) => handleInputChange('headline', e.target.value)}
                placeholder="e.g. High Energy HIIT & Strength Coach"
                className="w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-3 text-lg font-medium text-text-main placeholder-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white transition-all"
              />
              <p className="text-xs text-text-secondary">This is the first thing studios see. Keep it punchy.</p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-text-main dark:text-gray-300">Location</label>
            <div className="relative">
              <MapPin size={20} className="absolute left-4 top-3.5 text-gray-400" />
              <input
                type="text"
                value={profile.location || ''}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="City, State"
                className="w-full rounded-lg border-gray-200 bg-gray-50 pl-11 pr-4 py-3 text-text-main placeholder-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-text-main dark:text-gray-300">Instagram Handle</label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-gray-400 font-display font-bold text-sm">@</span>
              <input
                type="text"
                value={profile.instagram?.replace('@', '') || ''}
                onChange={(e) => handleInputChange('instagram', `@${e.target.value}`)}
                placeholder="username"
                className="w-full rounded-lg border-gray-200 bg-gray-50 pl-10 pr-4 py-3 text-text-main placeholder-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <div className="flex justify-between">
              <label className="text-sm font-bold text-text-main dark:text-gray-300">Bio</label>
              <span className="text-xs text-text-secondary">{(profile.bio || '').length}/300</span>
            </div>
            <textarea
              value={profile.bio || ''}
              onChange={(e) => handleInputChange('bio', e.target.value.slice(0, 300))}
              placeholder="Tell studios about your teaching style, energy, and background..."
              rows={4}
              className="w-full resize-none rounded-lg border-gray-200 bg-gray-50 px-4 py-3 text-text-main placeholder-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white transition-all"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
