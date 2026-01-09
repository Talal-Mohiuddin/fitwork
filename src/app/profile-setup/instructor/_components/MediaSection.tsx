import React, { useState } from 'react';
import { Play, Plus, X, Image } from 'lucide-react';
import { Profile } from '@/types';

interface MediaSectionProps {
  profile: Partial<Profile>;
  onChange: (updates: Partial<Profile>) => void;
}

export default function MediaSection({ profile, onChange }: MediaSectionProps) {
  const galleryImages = profile.gallery_images || [];
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 60 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const preview = event.target?.result as string;
        setVideoPreview(preview);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const preview = event.target?.result as string;
        onChange({ gallery_images: [...galleryImages, preview] });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeletePhoto = (index: number) => {
    onChange({ gallery_images: galleryImages.filter((_, i) => i !== index) });
  };

  return (
    <section className="scroll-mt-24" id="media">
      <h2 className="text-2xl font-display font-bold text-text-main dark:text-white mb-6 flex items-center gap-3">
        <span className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm">5</span>
        Media & Visuals
      </h2>

      <div className="rounded-2xl border border-gray-200 bg-surface-light dark:bg-surface-dark dark:border-gray-800 p-8 shadow-sm">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Intro Video */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-text-main dark:text-white">Intro Video (Optional)</h3>
            <label className="relative aspect-video w-full overflow-hidden rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex flex-col items-center justify-center cursor-pointer group">
              <div className="h-14 w-14 rounded-full bg-white dark:bg-surface-dark shadow-sm flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Play size={32} />
              </div>
              <p className="mt-4 text-sm font-medium text-text-main dark:text-white">Upload Intro Video</p>
              <p className="text-xs text-text-secondary mt-1">MP4 or MOV, max 60s</p>
              <input
                type="file"
                onChange={handleVideoUpload}
                accept="video/mp4,video/quicktime"
                className="hidden"
              />
            </label>
          </div>

          {/* Photo Gallery */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-text-main dark:text-white">Photo Gallery</h3>
            <div className="grid grid-cols-2 gap-4">
              {galleryImages.slice(0, 3).map((img, idx) => (
                <div key={idx} className="aspect-square rounded-xl bg-gray-100 dark:bg-gray-700 overflow-hidden relative group">
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${img})` }}
                  />
                  <button
                    onClick={() => handleDeletePhoto(idx)}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    type="button"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}

              {galleryImages.length < 4 && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex flex-col items-center justify-center cursor-pointer text-text-secondary hover:text-primary">
                  <Plus size={24} />
                  <span className="text-xs font-bold mt-2">Add Photo</span>
                  <input
                    type="file"
                    onChange={handlePhotoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </label>
              )}

              {[...Array(Math.max(0, 4 - galleryImages.length - 1))].map((_, idx) => (
                <div key={`empty-${idx}`} className="aspect-square rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 opacity-50 flex flex-col items-center justify-center">
                  <Image size={24} className="text-gray-300" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
