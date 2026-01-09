import React, { useState } from 'react';
import { Upload, Trash2, Image, ImagePlus } from 'lucide-react';
import { Profile } from '@/types';

interface GallerySectionProps {
  profile: Partial<Profile>;
  onChange: (updates: Partial<Profile>) => void;
}

export default function GallerySection({
  profile,
  onChange,
}: GallerySectionProps) {
  const galleryImages = profile.images || [];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const preview = event.target?.result as string;
        onChange({ images: [...galleryImages, preview] });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeletePhoto = (index: number) => {
    onChange({ images: galleryImages.filter((_, i) => i !== index) });
  };

  return (
    <section className="p-8 scroll-mt-24" id="gallery">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-text-main dark:text-white">
        <Image size={20} className="text-primary" />
        Studio Gallery
      </h2>

      {/* Upload Area */}
      <label className="border-2 border-dashed border-[#dbe6df] dark:border-gray-600 rounded-xl bg-background-light dark:bg-[#15241b] p-8 text-center mb-6 hover:bg-gray-50 dark:hover:bg-[#1c2e23] transition-colors cursor-pointer block">
        <div className="size-12 bg-white dark:bg-black rounded-full flex items-center justify-center border border-gray-100 dark:border-gray-700 mx-auto mb-4">
          <ImagePlus size={24} className="text-gray-400" />
        </div>
        <h3 className="font-bold text-sm mb-1 text-text-main dark:text-white">Upload Studio Photos</h3>
        <p className="text-xs text-gray-500 mb-0 dark:text-gray-400">
          Drag and drop or click to upload. Showcase your space, community, and vibe.
        </p>
        <input
          type="file"
          onChange={handlePhotoUpload}
          accept="image/*"
          className="hidden"
        />
      </label>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {galleryImages.slice(0, 4).map((img, idx) => (
          <div key={idx} className="aspect-square rounded-lg bg-gray-100 relative overflow-hidden group">
            <img
              src={img}
              alt={`Gallery item ${idx + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={() => handleDeletePhoto(idx)}
                className="text-white hover:text-red-400 transition-colors"
                type="button"
              >
                <Trash2 size={24} />
              </button>
            </div>
          </div>
        ))}

        {/* Empty Slots */}
        {[...Array(Math.max(0, 4 - galleryImages.length))].map((_, idx) => (
          <div
            key={`empty-${idx}`}
            className="aspect-square rounded-lg bg-gray-50 dark:bg-[#15241b] border border-gray-100 dark:border-gray-700 flex items-center justify-center"
          >
            <Image size={24} className="text-gray-300" />
          </div>
        ))}
      </div>
    </section>
  );
}
