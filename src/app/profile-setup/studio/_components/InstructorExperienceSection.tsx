"use client";

import { StudioProfileSetup } from "@/types";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";

interface InstructorExperienceSectionProps {
  profile: StudioProfileSetup;
  updateProfile: (updates: Partial<StudioProfileSetup>) => void;
}

const TOOLS_EQUIPMENT = [
  { id: "headset_mic", label: "Headset Mic" },
  { id: "handheld_mic", label: "Handheld Mic" },
  { id: "ipad_tablet", label: "iPad / Tablet" },
  { id: "bluetooth", label: "Bluetooth" },
  { id: "sound_system", label: "Sound System" },
  { id: "weights", label: "Weights" },
  { id: "mats", label: "Mats" },
  { id: "bands", label: "Resistance Bands" },
  { id: "bikes", label: "Bikes" },
  { id: "reformers", label: "Reformers" },
];

export default function InstructorExperienceSection({
  profile,
  updateProfile,
}: InstructorExperienceSectionProps) {
  const toggleEquipment = (equipmentId: string) => {
    const current = profile.tools_equipment || [];
    const updated = current.includes(equipmentId)
      ? current.filter((e) => e !== equipmentId)
      : [...current, equipmentId];
    updateProfile({ tools_equipment: updated });
  };

  const updateOnboarding = (key: 'audition_required' | 'paid_training', value: boolean) => {
    updateProfile({
      onboarding_requirements: {
        ...profile.onboarding_requirements,
        [key]: value,
      },
    });
  };

  const isCompleted = !!(
    profile.music_policy &&
    profile.tools_equipment &&
    profile.tools_equipment.length > 0
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 mb-6">
        <div className={`w-6 h-6 rounded flex items-center justify-center ${
          isCompleted ? 'bg-green-500 text-white' : 'bg-gray-300'
        }`}>
          {isCompleted && <Check className="w-4 h-4" />}
        </div>
        <h2 className="text-2xl font-semibold">Instructor Experience</h2>
      </div>

      {/* Music Policy */}
      <div>
        <Label className="text-base font-medium mb-3 block">Music Policy</Label>
        <p className="text-sm text-gray-600 mb-4">
          How do instructors handle music in your classes?
        </p>
        <RadioGroup
          value={profile.music_policy || ""}
          onValueChange={(value: 'instructor_choice' | 'studio_playlist' | 'mixed_model') => updateProfile({ music_policy: value })}
          className="space-y-3"
        >
          <Card
            className={`cursor-pointer transition-all ${
              profile.music_policy === "instructor_choice"
                ? "border-green-500 border-2 bg-green-50"
                : "hover:border-gray-400"
            }`}
            onClick={() => updateProfile({ music_policy: "instructor_choice" })}
          >
            <CardContent className="flex items-start space-x-3 p-4">
              <RadioGroupItem value="instructor_choice" id="instructor_choice" />
              <div>
                <label
                  htmlFor="instructor_choice"
                  className="text-sm font-semibold cursor-pointer block"
                >
                  Instructor Choice
                </label>
                <p className="text-xs text-gray-600 mt-1">
                  Instructors curate their own playlists.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all ${
              profile.music_policy === "studio_playlist"
                ? "border-green-500 border-2 bg-green-50"
                : "hover:border-gray-400"
            }`}
            onClick={() => updateProfile({ music_policy: "studio_playlist" })}
          >
            <CardContent className="flex items-start space-x-3 p-4">
              <RadioGroupItem value="studio_playlist" id="studio_playlist" />
              <div>
                <label
                  htmlFor="studio_playlist"
                  className="text-sm font-semibold cursor-pointer block"
                >
                  Studio Playlist
                </label>
                <p className="text-xs text-gray-600 mt-1">
                  Pre-approved or studio-owned music.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all ${
              profile.music_policy === "mixed_model"
                ? "border-green-500 border-2 bg-green-50"
                : "hover:border-gray-400"
            }`}
            onClick={() => updateProfile({ music_policy: "mixed_model" })}
          >
            <CardContent className="flex items-start space-x-3 p-4">
              <RadioGroupItem value="mixed_model" id="mixed_model" />
              <div>
                <label
                  htmlFor="mixed_model"
                  className="text-sm font-semibold cursor-pointer block"
                >
                  Mixed Model
                </label>
                <p className="text-xs text-gray-600 mt-1">
                  Guidelines provided, with some freedom.
                </p>
              </div>
            </CardContent>
          </Card>
        </RadioGroup>
      </div>

      {/* Tools & Equipment Provided */}
      <div>
        <Label className="text-base font-medium mb-3 block">
          Tools & Equipment Provided
        </Label>
        <p className="text-sm text-gray-600 mb-4">
          What equipment do you provide to instructors?
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TOOLS_EQUIPMENT.map((equipment) => {
            const isChecked = profile.tools_equipment?.includes(equipment.id);
            return (
              <div key={equipment.id} className="flex items-center space-x-3">
                <Checkbox
                  id={equipment.id}
                  checked={isChecked}
                  onCheckedChange={() => toggleEquipment(equipment.id)}
                />
                <label
                  htmlFor={equipment.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {equipment.label}
                </label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Onboarding Requirements */}
      <div>
        <Label className="text-base font-medium mb-3 block">
          Onboarding Requirements
        </Label>
        <p className="text-sm text-gray-600 mb-4">
          Do instructors need to demo a class?
        </p>
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-4 border rounded-lg">
            <Checkbox
              id="audition_required"
              checked={profile.onboarding_requirements?.audition_required || false}
              onCheckedChange={(checked: boolean) =>
                updateOnboarding("audition_required", checked)
              }
            />
            <div>
              <label
                htmlFor="audition_required"
                className="text-sm font-semibold cursor-pointer block"
              >
                Audition Required
              </label>
              <p className="text-xs text-gray-600 mt-1">
                Do instructors need to demo a class?
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg">
            <Checkbox
              id="paid_training"
              checked={profile.onboarding_requirements?.paid_training || false}
              onCheckedChange={(checked: boolean) =>
                updateOnboarding("paid_training", checked)
              }
            />
            <div>
              <label
                htmlFor="paid_training"
                className="text-sm font-semibold cursor-pointer block"
              >
                Paid Training
              </label>
              <p className="text-xs text-gray-600 mt-1">
                Is onboarding/training compensated?
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
