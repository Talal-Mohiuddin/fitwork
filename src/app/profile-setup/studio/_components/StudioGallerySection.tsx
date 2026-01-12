"use client";

import { useState } from "react";
import { StudioProfileSetup } from "@/types";
import { Label } from "@/components/ui/label";
import { Check, Upload, X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface StudioGallerySectionProps {
  profile: StudioProfileSetup;
  updateProfile: (updates: Partial<StudioProfileSetup>) => void;
}

export default function StudioGallerySection({
  profile,
  updateProfile,
}: StudioGallerySectionProps) {
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    const newImages: string[] = [];
    let processed = 0;

    Array.from(files).forEach((file) => {
      // Validate file size (max 5MB per image)
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large. Max size is 5MB.`);
        processed++;
        if (processed === files.length) setUploading(false);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        newImages.push(base64String);
        processed++;

        if (processed === files.length) {
          const currentPhotos = profile.gallery_photos || [];
          const updatedPhotos = [...currentPhotos, ...newImages];
          updateProfile({
            gallery_photos: updatedPhotos,
            images: updatedPhotos, // Also update the images field
          });
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const currentPhotos = profile.gallery_photos || [];
    const updatedPhotos = currentPhotos.filter((_, i) => i !== index);
    updateProfile({
      gallery_photos: updatedPhotos,
      images: updatedPhotos,
    });
  };

  const isCompleted = !!(profile.gallery_photos && profile.gallery_photos.length > 0);
  const photoCount = profile.gallery_photos?.length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <div className={`w-6 h-6 rounded flex items-center justify-center ${
          isCompleted ? 'bg-green-500 text-white' : 'bg-gray-300'
        }`}>
          {isCompleted && <Check className="w-4 h-4" />}
        </div>
        <h2 className="text-2xl font-semibold">Studio Gallery</h2>
      </div>

      <div>
        <Label className="text-base font-medium mb-2 block">Upload Studio Photos</Label>
        <p className="text-sm text-gray-600 mb-4">
          Drag and drop or click to upload. Showcase your space, equipment, and vibe. (Max 10
          photos)
        </p>

        {/* Upload Area */}
        <div className="mb-6">
          <label
            htmlFor="gallery-upload"
            className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              uploading
                ? "border-gray-300 bg-gray-50"
                : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
            }`}
          >
            {uploading ? (
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm text-gray-600">Uploading photos...</p>
              </div>
            ) : (
              <div className="text-center">
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-semibold text-green-600">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-400">PNG, JPG or GIF. Max 5MB per photo.</p>
              </div>
            )}
            <input
              id="gallery-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              disabled={uploading || photoCount >= 10}
              className="hidden"
            />
          </label>
          {photoCount >= 10 && (
            <p className="text-sm text-orange-600 mt-2">
              Maximum of 10 photos reached. Remove a photo to upload more.
            </p>
          )}
        </div>

        {/* Photo Grid */}
        {profile.gallery_photos && profile.gallery_photos.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">
                Uploaded Photos ({photoCount}/10)
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {profile.gallery_photos.map((photo, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 group"
                >
                  <Image
                    src={photo}
                    alt={`Studio photo ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs">Photo {index + 1}</p>
                  </div>
                </div>
              ))}

              {/* Add More Button */}
              {photoCount < 10 && (
                <label
                  htmlFor="gallery-upload"
                  className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-xs text-gray-600">Add More</span>
                </label>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
