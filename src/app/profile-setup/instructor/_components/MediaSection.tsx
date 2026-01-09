import React, { useState, useRef } from 'react';
import { Play, Plus, X, Image, Upload, Video, Sparkles, Trash2, GripVertical, Camera } from 'lucide-react';
import { Profile } from '@/types';

interface MediaSectionProps {
  profile: Partial<Profile>;
  onChange: (updates: Partial<Profile>) => void;
}

export default function MediaSection({ profile, onChange }: MediaSectionProps) {
  const galleryImages = profile.gallery_images || [];
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 60 * 1024 * 1024) {
      setIsVideoUploading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const preview = event.target?.result as string;
        setVideoPreview(preview);
        setIsVideoUploading(false);
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const preview = event.target?.result as string;
        onChange({ gallery_images: [...galleryImages, preview] });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <section className="scroll-mt-24" id="media">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
        <span className="flex items-center justify-center h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-sm font-bold">5</span>
        Media & Visuals
      </h2>

      <div className="space-y-6">
        {/* Intro Video Section */}
        <div className="rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-emerald-500" />
                Intro Video
                <span className="text-xs font-normal text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">Optional</span>
              </h3>
              <p className="text-sm text-slate-500 mt-1">A short video introduction helps you stand out and connect with studios.</p>
            </div>
          </div>

          {videoPreview ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-900">
              <video
                src={videoPreview}
                className="w-full h-full object-cover"
                controls
              />
              <button
                onClick={() => setVideoPreview(null)}
                className="absolute top-3 right-3 p-2 bg-black/70 hover:bg-black text-white rounded-lg transition-colors"
                type="button"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ) : (
            <label className="relative aspect-video w-full overflow-hidden rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-gradient-to-b from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-800 hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all flex flex-col items-center justify-center cursor-pointer group">
              {isVideoUploading ? (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
                  <p className="mt-4 text-sm font-medium text-slate-600 dark:text-slate-300">Uploading...</p>
                </div>
              ) : (
                <>
                  <div className="h-16 w-16 rounded-2xl bg-white dark:bg-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                    <Play size={32} className="ml-1" />
                  </div>
                  <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-200">Upload your intro video</p>
                  <p className="text-xs text-slate-400 mt-1">MP4 or MOV, max 60 seconds</p>
                  <div className="mt-4 px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg group-hover:bg-emerald-600 transition-colors">
                    Choose File
                  </div>
                </>
              )}
              <input
                ref={videoInputRef}
                type="file"
                onChange={handleVideoUpload}
                accept="video/mp4,video/quicktime"
                className="hidden"
              />
            </label>
          )}

          {/* Video Tips */}
          <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800/30">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">Pro tip for your video</p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Keep it under 30 seconds, introduce yourself, and show your teaching style. Profiles with videos get 3x more inquiries!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Photo Gallery Section */}
        <div className="rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-500" />
                Photo Gallery
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{galleryImages.length}/6</span>
              </h3>
              <p className="text-sm text-slate-500 mt-1">Showcase your teaching environment and style with high-quality photos.</p>
            </div>
            {galleryImages.length < 6 && (
              <label className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-2">
                <Plus size={16} />
                Add Photo
                <input
                  ref={photoInputRef}
                  type="file"
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Drag & Drop Area */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            className={`transition-all ${isDragging ? 'ring-2 ring-emerald-500 ring-offset-2 rounded-xl' : ''}`}
          >
            {galleryImages.length === 0 ? (
              <label className="aspect-[2/1] w-full overflow-hidden rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all flex flex-col items-center justify-center cursor-pointer">
                <div className="h-14 w-14 rounded-xl bg-white dark:bg-slate-800 shadow-md flex items-center justify-center text-slate-400">
                  <Upload size={24} />
                </div>
                <p className="mt-4 text-sm font-medium text-slate-600 dark:text-slate-300">Drop photos here or click to upload</p>
                <p className="text-xs text-slate-400 mt-1">JPEG or PNG, max 5MB each</p>
                <input
                  type="file"
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  className="hidden"
                />
              </label>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {galleryImages.map((img, idx) => (
                  <div 
                    key={idx} 
                    className={`relative overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 group ${idx === 0 ? 'sm:col-span-2 sm:row-span-2' : ''}`}
                    style={{ aspectRatio: idx === 0 ? '1' : '1' }}
                  >
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                      style={{ backgroundImage: `url(${img})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    {/* Actions */}
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleDeletePhoto(idx)}
                        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-lg"
                        type="button"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Drag Handle */}
                    <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="p-1.5 bg-black/50 text-white rounded-lg">
                        <GripVertical size={14} />
                      </div>
                    </div>

                    {/* Main Photo Badge */}
                    {idx === 0 && (
                      <div className="absolute bottom-2 right-2 px-2 py-1 bg-emerald-500 text-white text-xs font-bold rounded-lg">
                        Cover Photo
                      </div>
                    )}
                  </div>
                ))}

                {/* Add More Placeholder */}
                {galleryImages.length < 6 && (
                  <label className="aspect-square rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all flex flex-col items-center justify-center cursor-pointer">
                    <Plus size={24} className="text-slate-400" />
                    <span className="text-xs font-medium text-slate-500 mt-2">Add More</span>
                    <input
                      type="file"
                      onChange={handlePhotoUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            )}
          </div>

          {/* Photo Tips */}
          {galleryImages.length > 0 && galleryImages.length < 4 && (
            <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Tip:</span> Profiles with at least 4 photos are more likely to get contacted by studios.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
