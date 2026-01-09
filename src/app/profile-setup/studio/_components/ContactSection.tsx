import React from 'react';
import { MapPin, Globe, Instagram } from 'lucide-react';
import { Profile } from '@/types';

interface ContactSectionProps {
  profile: Partial<Profile>;
  onChange: (updates: Partial<Profile>) => void;
}

export default function ContactSection({ profile, onChange }: ContactSectionProps) {
  return (
    <section className="p-8 scroll-mt-24" id="contact">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-text-main dark:text-white">
        <MapPin size={20} className="text-primary" />
        Contact & Location
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Street Address */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1.5 text-text-main dark:text-white">
            Street Address
          </label>
          <div className="relative">
            <input
              type="text"
              value={profile.location || ''}
              onChange={(e) => onChange({ location: e.target.value })}
              placeholder="123 Fitness Blvd"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-background-light dark:bg-[#15241b] border-transparent focus:border-primary focus:ring-0 text-sm placeholder-gray-400 dark:placeholder-gray-500 transition-all text-text-main dark:text-white"
            />
            <MapPin size={20} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium mb-1.5 text-text-main dark:text-white">
            City
          </label>
          <input
            type="text"
            placeholder="San Francisco"
            className="w-full px-4 py-2.5 rounded-lg bg-background-light dark:bg-[#15241b] border-transparent focus:border-primary focus:ring-0 text-sm placeholder-gray-400 dark:placeholder-gray-500 transition-all text-text-main dark:text-white"
          />
        </div>

        {/* State & Zip */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-text-main dark:text-white">
              State
            </label>
            <select className="w-full px-4 py-2.5 rounded-lg bg-background-light dark:bg-[#15241b] border-transparent focus:border-primary focus:ring-0 text-sm transition-all appearance-none text-text-main dark:text-white">
              <option>CA</option>
              <option>NY</option>
              <option>TX</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-text-main dark:text-white">
              Zip Code
            </label>
            <input
              type="text"
              placeholder="94102"
              className="w-full px-4 py-2.5 rounded-lg bg-background-light dark:bg-[#15241b] border-transparent focus:border-primary focus:ring-0 text-sm placeholder-gray-400 dark:placeholder-gray-500 transition-all text-text-main dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Map Preview */}
      <div className="w-full h-48 rounded-xl overflow-hidden mb-6 relative bg-gray-100 group">
        <img
          className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
          alt="Map preview"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWG8Virr9YFxtpjLiIWDtj9E29BOXOC9TWNkiZK_uAyPC2PlB9gGD5u-GRrNtnkr6Oz5dMH-HaERk3jsLSK6qA2Pu5mB2yOmnI-a0XJ_dg_AQ_jcm6uzEoX_fMgbKkIs1jfPlOfdoo9f-syCLs_OWFa_KSOdyj5LNzPum3CjipaYALzjI_gS0RFZrshv_1ih72IrJpB-39vnl7N9AA16sLLZmLeQDfskAHLjT7Xjzj_8Qlry4l2nLD2XE2-OYQ5NZ7pQcxR6jPJjI"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <div className="bg-white dark:bg-black p-2 rounded-full shadow-lg text-primary animate-bounce">
            <MapPin size={32} />
          </div>
        </div>
      </div>

      {/* Website & Social */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1.5 text-text-main dark:text-white">
            Website
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-transparent bg-gray-100 dark:bg-[#0f1a13] text-gray-500 text-sm">
              https://
            </span>
            <input
              type="text"
              placeholder="www.yourstudio.com"
              value={profile.website || ''}
              onChange={(e) => onChange({ website: e.target.value })}
              className="flex-1 min-w-0 block w-full px-4 py-2.5 rounded-r-lg bg-background-light dark:bg-[#15241b] border-transparent focus:border-primary focus:ring-0 text-sm transition-all placeholder-gray-400 dark:placeholder-gray-500 text-text-main dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5 text-text-main dark:text-white">
            Instagram
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="@yourstudio"
              value={profile.instagram || ''}
              onChange={(e) => onChange({ instagram: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-background-light dark:bg-[#15241b] border-transparent focus:border-primary focus:ring-0 text-sm placeholder-gray-400 dark:placeholder-gray-500 transition-all text-text-main dark:text-white"
            />
            <Instagram size={20} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
        </div>
      </div>
    </section>
  );
}
