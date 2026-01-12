"use client";

import { StudioProfileSetup } from "@/types";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface ClassStylesSectionProps {
  profile: StudioProfileSetup;
  updateProfile: (updates: Partial<StudioProfileSetup>) => void;
}

const CLASS_TYPES = [
  "Yoga",
  "Pilates",
  "HIIT",
  "Spin / Cycle",
  "Barre",
  "Boxing",
  "Dance",
  "Strength Training",
  "Cardio",
  "Meditation",
  "Bootcamp",
  "TRX",
  "Rowing",
  "Kickboxing",
  "Zumba",
  "Sculpt",
];

const MEMBER_AMENITIES = [
  { id: "showers", label: "Showers" },
  { id: "lockers", label: "Lockers" },
  { id: "towel_service", label: "Towel Service" },
  { id: "smoothie_bar", label: "Smoothie Bar" },
  { id: "parking", label: "Parking" },
  { id: "bike_storage", label: "Bike Storage" },
  { id: "retail", label: "Retail Shop" },
  { id: "wifi", label: "Free WiFi" },
  { id: "childcare", label: "Childcare" },
];

export default function ClassStylesSection({ profile, updateProfile }: ClassStylesSectionProps) {
  const toggleClassType = (classType: string) => {
    const current = profile.class_types || [];
    const updated = current.includes(classType)
      ? current.filter((c) => c !== classType)
      : [...current, classType];
    updateProfile({ class_types: updated, styles: updated });
  };

  const toggleAmenity = (amenityId: string) => {
    const current = profile.member_amenities || [];
    const updated = current.includes(amenityId)
      ? current.filter((a) => a !== amenityId)
      : [...current, amenityId];
    updateProfile({ member_amenities: updated, amenities: updated });
  };

  const isCompleted = !!(profile.class_types && profile.class_types.length > 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 mb-6">
        <div className={`w-6 h-6 rounded flex items-center justify-center ${
          isCompleted ? 'bg-green-500 text-white' : 'bg-gray-300'
        }`}>
          {isCompleted && <Check className="w-4 h-4" />}
        </div>
        <h2 className="text-2xl font-semibold">Class Styles & Amenities</h2>
      </div>

      {/* Class Types Offered */}
      <div>
        <Label className="text-base font-medium mb-3 block">
          Class Types Offered
        </Label>
        <p className="text-sm text-gray-600 mb-4">
          Select all class types your studio offers
        </p>
        <div className="flex flex-wrap gap-2">
          {CLASS_TYPES.map((classType) => {
            const isSelected = profile.class_types?.includes(classType);
            return (
              <Badge
                key={classType}
                variant={isSelected ? "default" : "outline"}
                className={`cursor-pointer px-4 py-2 text-sm ${
                  isSelected
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => toggleClassType(classType)}
              >
                {classType}
                {isSelected && <Check className="w-3 h-3 ml-2" />}
              </Badge>
            );
          })}
        </div>
        <button
          onClick={() => {
            const customType = prompt("Enter custom class type:");
            if (customType && customType.trim()) {
              toggleClassType(customType.trim());
            }
          }}
          className="mt-3 text-sm text-green-600 hover:text-green-700 font-medium"
        >
          + Add Custom
        </button>
      </div>

      {/* Member Amenities */}
      <div>
        <Label className="text-base font-medium mb-3 block">
          Member Amenities
        </Label>
        <p className="text-sm text-gray-600 mb-4">
          What amenities do you provide to members and instructors?
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MEMBER_AMENITIES.map((amenity) => {
            const isChecked = profile.member_amenities?.includes(amenity.id);
            return (
              <div key={amenity.id} className="flex items-center space-x-3">
                <Checkbox
                  id={amenity.id}
                  checked={isChecked}
                  onCheckedChange={() => toggleAmenity(amenity.id)}
                />
                <label
                  htmlFor={amenity.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {amenity.label}
                </label>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
