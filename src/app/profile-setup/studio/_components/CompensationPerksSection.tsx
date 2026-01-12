"use client";

import { StudioProfileSetup } from "@/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Check, DollarSign, TrendingUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CompensationPerksSectionProps {
  profile: StudioProfileSetup;
  updateProfile: (updates: Partial<StudioProfileSetup>) => void;
}

const ADDITIONAL_PERKS = [
  { id: "free_membership", label: "Free Membership" },
  { id: "guest_passes", label: "Guest Passes" },
  { id: "retail_discount", label: "Retail Discount" },
  { id: "health_benefits", label: "Health Benefits" },
  { id: "continuing_education", label: "Continuing Education" },
  { id: "performance_bonuses", label: "Performance Bonuses" },
  { id: "flexible_schedule", label: "Flexible Schedule" },
  { id: "paid_time_off", label: "Paid Time Off" },
];

export default function CompensationPerksSection({
  profile,
  updateProfile,
}: CompensationPerksSectionProps) {
  const togglePerk = (perkId: string) => {
    const current = profile.additional_perks || [];
    const updated = current.includes(perkId)
      ? current.filter((p) => p !== perkId)
      : [...current, perkId];
    updateProfile({ additional_perks: updated });
  };

  const isCompleted = !!(
    profile.base_pay_min &&
    profile.base_pay_max &&
    profile.pay_model
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 mb-6">
        <div className={`w-6 h-6 rounded flex items-center justify-center ${
          isCompleted ? 'bg-green-500 text-white' : 'bg-gray-300'
        }`}>
          {isCompleted && <Check className="w-4 h-4" />}
        </div>
        <h2 className="text-2xl font-semibold">Compensation & Perks</h2>
      </div>

      {/* Pay Transparency Signal */}
      <Card className={`border-2 ${
        profile.pay_transparency
          ? "border-green-500 bg-green-50"
          : "border-blue-400 bg-blue-50"
      }`}>
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <div className="shrink-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                profile.pay_transparency ? "bg-green-500" : "bg-blue-500"
              }`}>
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">Pay Transparency Signal</h3>
                <Checkbox
                  id="pay_transparency"
                  checked={profile.pay_transparency || false}
                  onCheckedChange={(checked: boolean) =>
                    updateProfile({ pay_transparency: checked })
                  }
                />
              </div>
              <p className="text-sm text-gray-700 mt-2">
                Disclose what you pay upfront to more qualified applicants. This data will
                be shown on your public profile.
              </p>
              {profile.pay_transparency && (
                <Badge className="mt-3 bg-green-600">
                  High Priority - Visible to all instructors
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Base Pay Range Per Class */}
      <div>
        <Label className="text-base font-medium mb-3 block">
          Base Pay Range (Per Class)
        </Label>
        <p className="text-sm text-gray-600 mb-4">
          What&apos;s your typical pay range for instructors per class?
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
          <div>
            <Label htmlFor="base_pay_min" className="text-sm mb-2 block">
              Minimum
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                id="base_pay_min"
                type="number"
                placeholder="Min"
                value={profile.base_pay_min || ""}
                onChange={(e) =>
                  updateProfile({ base_pay_min: parseInt(e.target.value) || undefined })
                }
                className="pl-9"
                min="0"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="base_pay_max" className="text-sm mb-2 block">
              Maximum
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                id="base_pay_max"
                type="number"
                placeholder="Max"
                value={profile.base_pay_max || ""}
                onChange={(e) =>
                  updateProfile({ base_pay_max: parseInt(e.target.value) || undefined })
                }
                className="pl-9"
                min="0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Pay Model */}
      <div>
        <Label htmlFor="pay_model" className="text-base font-medium mb-3 block">
          Pay Model
        </Label>
        <p className="text-sm text-gray-600 mb-4">
          How do you structure instructor compensation?
        </p>
        <Select
          value={profile.pay_model || ""}
          onValueChange={(value: 'flat_rate' | 'tiered' | 'hourly') => updateProfile({ pay_model: value })}
        >
          <SelectTrigger id="pay_model" className="max-w-md">
            <SelectValue placeholder="Select pay model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="flat_rate">
              <div>
                <div className="font-semibold">Flat Rate</div>
                <div className="text-xs text-gray-600">Fixed amount per class</div>
              </div>
            </SelectItem>
            <SelectItem value="tiered">
              <div>
                <div className="font-semibold">Tiered</div>
                <div className="text-xs text-gray-600">Based on experience/attendance</div>
              </div>
            </SelectItem>
            <SelectItem value="hourly">
              <div>
                <div className="font-semibold">Hourly</div>
                <div className="text-xs text-gray-600">Hourly rate compensation</div>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Additional Perks */}
      <div>
        <Label className="text-base font-medium mb-3 block">Additional Perks</Label>
        <p className="text-sm text-gray-600 mb-4">
          What other benefits do you offer instructors?
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ADDITIONAL_PERKS.map((perk) => {
            const isChecked = profile.additional_perks?.includes(perk.id);
            return (
              <div key={perk.id} className="flex items-center space-x-3">
                <Checkbox
                  id={perk.id}
                  checked={isChecked}
                  onCheckedChange={() => togglePerk(perk.id)}
                />
                <label
                  htmlFor={perk.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {perk.label}
                </label>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
