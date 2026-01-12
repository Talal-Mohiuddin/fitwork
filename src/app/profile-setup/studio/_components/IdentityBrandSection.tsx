"use client";

import { useState } from "react";
import { StudioProfileSetup } from "@/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Check, Upload, X } from "lucide-react";
import Image from "next/image";

interface IdentityBrandSectionProps {
  profile: StudioProfileSetup;
  updateProfile: (updates: Partial<StudioProfileSetup>) => void;
}

export default function IdentityBrandSection({ profile, updateProfile }: IdentityBrandSectionProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(profile.logo || null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert("File size must be less than 2MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setLogoPreview(base64String);
        updateProfile({ logo: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoPreview(null);
    updateProfile({ logo: undefined });
  };

  const handleStudioNameChange = (value: string) => {
    updateProfile({ studio_name: value, name: value });
  };

  const handleAboutChange = (value: string) => {
    updateProfile({ about_studio: value, description: value });
  };

  const isCompleted = !!(profile.logo && profile.studio_name && profile.about_studio);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <div className={`w-6 h-6 rounded flex items-center justify-center ${
          isCompleted ? 'bg-green-500 text-white' : 'bg-gray-300'
        }`}>
          {isCompleted && <Check className="w-4 h-4" />}
        </div>
        <h2 className="text-2xl font-semibold">Identify & Brand</h2>
      </div>

      {/* Studio Logo */}
      <div>
        <Label htmlFor="logo" className="text-base font-medium mb-2 block">
          Studio Logo
        </Label>
        <div className="mt-2">
          {logoPreview ? (
            <div className="relative w-32 h-32 border-2 border-gray-200 rounded-lg overflow-hidden">
              <Image
                src={logoPreview}
                alt="Studio logo"
                fill
                className="object-cover"
              />
              <button
                onClick={removeLogo}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="logo-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
            >
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">Upload your logo</span>
              <span className="text-xs text-gray-400 mt-1">PNG, JPG or GIF. Max 2MB.</span>
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => document.getElementById('logo-upload')?.click()}
        >
          Choose File
        </Button>
      </div>

      {/* Studio Name */}
      <div>
        <Label htmlFor="studio-name" className="text-base font-medium mb-2 block">
          Studio Name
        </Label>
        <Input
          id="studio-name"
          placeholder="e.g. Zen Garden Yoga"
          value={profile.studio_name || ""}
          onChange={(e) => handleStudioNameChange(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* About the Studio */}
      <div>
        <Label htmlFor="about-studio" className="text-base font-medium mb-2 block">
          About the Studio
        </Label>
        <Textarea
          id="about-studio"
          placeholder="Describe your studio's vibe, mission, and community. What makes you unique?"
          value={profile.about_studio || ""}
          onChange={(e) => handleAboutChange(e.target.value)}
          rows={6}
          maxLength={500}
          className="resize-none"
        />
        <div className="text-right text-sm text-gray-500 mt-1">
          {profile.about_studio?.length || 0}/500 characters
        </div>
      </div>
    </div>
  );
}
