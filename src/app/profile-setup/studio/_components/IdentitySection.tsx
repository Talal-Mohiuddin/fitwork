import React, { useState } from 'react';
import { Image, Tag } from 'lucide-react';
import { Profile } from '@/types';

interface IdentitySectionProps {
  profile: Partial<Profile>;
  onChange: (updates: Partial<Profile>) => void;
}

export default function IdentitySection({ profile, onChange }: IdentitySectionProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 2 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const preview = event.target?.result as string;
        setLogoPreview(preview);
        onChange({ images: [preview] });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <section className="p-8 scroll-mt-24" id="identity">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-text-main dark:text-white">
        <Tag size={20} className="text-primary" />
        Identity & Brand
      </h2>

      <div className="grid gap-6 max-w-2xl">
        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-medium mb-2 text-text-main dark:text-white">
            Studio Logo
          </label>
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center p-6 border-2 border-dashed border-[#dbe6df] dark:border-gray-600 rounded-xl bg-background-light dark:bg-[#15241b]">
            <div className="size-20 bg-white dark:bg-black rounded-full flex items-center justify-center border border-gray-100 dark:border-gray-700 shrink-0">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo preview" className="w-full h-full rounded-full object-cover" />
              ) : (
                <Image size={32} className="text-gray-300" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm mb-1 text-text-main dark:text-white">Upload your logo</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">PNG, JPG or GIF. Max 2MB.</p>
              <label className="inline-flex items-center justify-center px-4 py-2 bg-white dark:bg-[#2a4030] border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-[#344e3b] transition-colors shadow-sm cursor-pointer">
                Choose File
                <input
                  type="file"
                  onChange={handleLogoChange}
                  accept="image/*"
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Studio Name */}
        <div>
          <label className="block text-sm font-medium mb-1.5 text-text-main dark:text-white">
            Studio Name
          </label>
          <input
            type="text"
            value={profile.name || ''}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="e.g. Zen Garden Yoga"
            className="w-full px-4 py-2.5 rounded-lg bg-background-light dark:bg-[#15241b] border-transparent focus:border-primary focus:ring-0 text-sm placeholder-gray-400 dark:placeholder-gray-500 transition-all text-text-main dark:text-white"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1.5 text-text-main dark:text-white">
            About the Studio
          </label>
          <textarea
            value={profile.description || ''}
            onChange={(e) => onChange({ description: e.target.value.slice(0, 500) })}
            placeholder="Describe your studio's vibe, mission, and community. What makes you unique?"
            rows={4}
            className="w-full px-4 py-2.5 rounded-lg bg-background-light dark:bg-[#15241b] border-transparent focus:border-primary focus:ring-0 text-sm placeholder-gray-400 dark:placeholder-gray-500 transition-all resize-none text-text-main dark:text-white"
          />
          <div className="flex justify-end mt-1">
            <span className="text-xs text-gray-400">
              {(profile.description || '').length}/500 characters
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
