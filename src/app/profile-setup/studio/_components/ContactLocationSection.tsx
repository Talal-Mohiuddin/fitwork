"use client";

import { useEffect } from "react";
import { StudioProfileSetup } from "@/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Check, MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ContactLocationSectionProps {
  profile: StudioProfileSetup;
  updateProfile: (updates: Partial<StudioProfileSetup>) => void;
}

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

export default function ContactLocationSection({ profile, updateProfile }: ContactLocationSectionProps) {
  // Geocode address when all fields are filled
  useEffect(() => {
    if (profile.street_address && profile.city && profile.state && profile.zip_code) {
      const fullAddress = `${profile.street_address}, ${profile.city}, ${profile.state} ${profile.zip_code}`;
      updateProfile({ location: fullAddress });
      
      // In a real implementation, you would geocode this address
      // For now, we'll just update the map center with dummy data
      // You can integrate Google Maps Geocoding API here
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.street_address, profile.city, profile.state, profile.zip_code]);

  const isCompleted = !!(
    profile.street_address &&
    profile.city &&
    profile.state &&
    profile.zip_code
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <div className={`w-6 h-6 rounded flex items-center justify-center ${
          isCompleted ? 'bg-green-500 text-white' : 'bg-gray-300'
        }`}>
          {isCompleted && <Check className="w-4 h-4" />}
        </div>
        <h2 className="text-2xl font-semibold">Contact & Location</h2>
      </div>

      {/* Street Address */}
      <div>
        <Label htmlFor="street-address" className="text-base font-medium mb-2 block">
          Street Address
        </Label>
        <Input
          id="street-address"
          placeholder="123 Fitness Blvd"
          value={profile.street_address || ""}
          onChange={(e) => updateProfile({ street_address: e.target.value })}
          className="max-w-md"
        />
      </div>

      {/* City, State, Zip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="city" className="text-base font-medium mb-2 block">
            City
          </Label>
          <Input
            id="city"
            placeholder="San Francisco"
            value={profile.city || ""}
            onChange={(e) => updateProfile({ city: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="state" className="text-base font-medium mb-2 block">
            State
          </Label>
          <Select
            value={profile.state || ""}
            onValueChange={(value) => updateProfile({ state: value })}
          >
            <SelectTrigger id="state">
              <SelectValue placeholder="CA" />
            </SelectTrigger>
            <SelectContent>
              {US_STATES.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="zip-code" className="text-base font-medium mb-2 block">
            Zip Code
          </Label>
          <Input
            id="zip-code"
            placeholder="94102"
            value={profile.zip_code || ""}
            onChange={(e) => updateProfile({ zip_code: e.target.value })}
            maxLength={5}
          />
        </div>
      </div>

      {/* Map Preview */}
      <div>
        <Label className="text-base font-medium mb-2 block">Location Preview</Label>
        <div className="w-full h-64 bg-gray-100 rounded-lg relative overflow-hidden border-2 border-gray-200">
          {isCompleted ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  {profile.street_address}, {profile.city}, {profile.state} {profile.zip_code}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Map integration available with Google Maps API
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-gray-400">
                <MapPin className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm">Enter address to preview location</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Website */}
      <div>
        <Label htmlFor="website" className="text-base font-medium mb-2 block">
          Website
        </Label>
        <Input
          id="website"
          type="url"
          placeholder="https://www.yourstudio.com"
          value={profile.website || ""}
          onChange={(e) => updateProfile({ website: e.target.value })}
          className="max-w-md"
        />
      </div>

      {/* Instagram */}
      <div>
        <Label htmlFor="instagram" className="text-base font-medium mb-2 block">
          Instagram
        </Label>
        <div className="flex items-center max-w-md">
          <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 rounded-l-md">
            @
          </span>
          <Input
            id="instagram"
            placeholder="yourstudio"
            value={profile.instagram || ""}
            onChange={(e) => updateProfile({ instagram: e.target.value })}
            className="rounded-l-none"
          />
        </div>
      </div>
    </div>
  );
}
