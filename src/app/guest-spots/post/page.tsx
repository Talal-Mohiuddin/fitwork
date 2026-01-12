"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Plane,
  DollarSign,
  Calendar,
  MapPin,
  Loader2,
  CheckCircle,
  Plus,
  X,
  Home,
  Utensils,
  Megaphone,
  Award,
  Car,
  Camera,
  Globe,
  AlertCircle,
} from "lucide-react";
import { createGuestSpot } from "@/services/guestSpotService";
import { useAuth } from "@/store/firebase-auth-provider";
import Link from "next/link";

type GuestSpotFormData = {
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  duration_type: "single_class" | "workshop" | "weekend" | "week" | "retreat" | "series";
  compensation: string;
  styles: string[];
  requirements: string[];
  min_experience: string;
  accommodations_provided: boolean;
  travel_covered: boolean;
  meals_included: boolean;
  promo_support: boolean;
  studio_perks: boolean;
  local_transport: boolean;
  content_provided: boolean;
  public_event: boolean;
};

const fitnessStyles = [
  "HIIT",
  "Strength Training",
  "Functional Training",
  "CrossFit",
  "Olympic Weightlifting",
  "Kettlebell Training",
  "Calisthenics / Bodyweight",
  "Yoga",
  "Hot Yoga",
  "Pilates (Mat)",
  "Reformer Pilates",
  "Breathwork",
  "Barre",
  "Dance Fitness",
  "Spinning",
  "Running Coaching",
  "Aqua Fitness",
  "Bootcamp",
];

const durationTypes = [
  { value: "single_class", label: "Single Class" },
  { value: "workshop", label: "Workshop" },
  { value: "weekend", label: "Weekend" },
  { value: "week", label: "Week" },
  { value: "retreat", label: "Retreat" },
  { value: "series", label: "Series" },
];

const experienceLevels = [
  { value: "any", label: "Any Experience Level" },
  { value: "1+ years", label: "1+ Years" },
  { value: "2+ years", label: "2+ Years" },
  { value: "3+ years", label: "3+ Years" },
  { value: "5+ years", label: "5+ Years" },
  { value: "certified", label: "Certified Required" },
];

export default function PostGuestSpotPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<GuestSpotFormData>({
    title: "",
    description: "",
    location: "",
    start_date: "",
    end_date: "",
    duration_type: "workshop",
    compensation: "",
    styles: [] as string[],
    requirements: [] as string[],
    min_experience: "any",
    accommodations_provided: false,
    travel_covered: false,
    meals_included: false,
    promo_support: false,
    studio_perks: false,
    local_transport: false,
    content_provided: false,
    public_event: false,
  });

  const [newRequirement, setNewRequirement] = useState("");

  // Check if user is a studio
  useEffect(() => {
    if (!profile) return;

    if (profile.user_type !== "studio") {
      router.push("/guest-spots");
    }
  }, [profile, router]);

  const handleStyleToggle = (style: string) => {
    setFormData((prev) => ({
      ...prev,
      styles: prev.styles.includes(style)
        ? prev.styles.filter((s) => s !== style)
        : [...prev.styles, style],
    }));
  };

  const handleAddRequirement = () => {
    if (newRequirement.trim()) {
      setFormData((prev) => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()],
      }));
      setNewRequirement("");
    }
  };

  const handleRemoveRequirement = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user || !profile) {
      setError("You must be logged in to post a guest spot");
      return;
    }

    if (profile.user_type !== "studio") {
      setError("Only studios can post guest spots");
      return;
    }

    // Validation
    if (!formData.title.trim()) {
      setError("Please enter a title");
      return;
    }
    if (!formData.description.trim()) {
      setError("Please enter a description");
      return;
    }
    if (!formData.location.trim()) {
      setError("Please enter a location");
      return;
    }
    if (!formData.start_date) {
      setError("Please select a start date");
      return;
    }
    if (!formData.end_date) {
      setError("Please select an end date");
      return;
    }
    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      setError("End date must be after start date");
      return;
    }
    if (!formData.compensation.trim()) {
      setError("Please enter compensation details");
      return;
    }
    if (formData.styles.length === 0) {
      setError("Please select at least one fitness style");
      return;
    }

    setIsSubmitting(true);

    try {
      await createGuestSpot(user.uid, {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        start_date: formData.start_date,
        end_date: formData.end_date,
        duration_type: formData.duration_type,
        compensation: formData.compensation,
        styles: formData.styles,
        requirements: formData.requirements,
        min_experience: formData.min_experience === "any" ? undefined : formData.min_experience,
        accommodations_provided: formData.accommodations_provided,
        travel_covered: formData.travel_covered,
        meals_included: formData.meals_included,
        promo_support: formData.promo_support,
        studio_perks: formData.studio_perks,
        local_transport: formData.local_transport,
        content_provided: formData.content_provided,
        public_event: formData.public_event,
        studio_id: user.uid,
      });

      setIsSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/studio");
      }, 2000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create guest spot";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-text-main dark:text-white mb-2">
            Guest Spot Posted!
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Redirecting to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/studio"
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-primary mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Plane className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-main dark:text-white">
                Post a Guest Spot
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Find traveling instructors for your studio
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Basic Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-text-main dark:text-white mb-4">
              Basic Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title *
                </label>
                <Input
                  placeholder="e.g., Weekend Yoga Retreat Leader Needed"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description *
                </label>
                <Textarea
                  placeholder="Describe the opportunity, what the instructor will be doing, class formats, etc."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={5}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Location *
                  </label>
                  <Input
                    placeholder="e.g., Bali, Indonesia"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Duration Type *
                  </label>
                  <Select
                    value={formData.duration_type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, duration_type: value as GuestSpotFormData['duration_type'] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {durationTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Start Date *
                  </label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    End Date *
                  </label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
                    }
                    min={formData.start_date || new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Compensation *
                </label>
                <Input
                  placeholder="e.g., $500/day, $2000 total, Negotiable"
                  value={formData.compensation}
                  onChange={(e) =>
                    setFormData({ ...formData, compensation: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Fitness Styles */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-text-main dark:text-white mb-4">
              Fitness Styles *
            </h2>
            <div className="flex flex-wrap gap-2">
              {fitnessStyles.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => handleStyleToggle(style)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    formData.styles.includes(style)
                      ? "bg-primary text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-text-main dark:text-white mb-4">
              Requirements (Optional)
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Minimum Experience
                </label>
                <Select
                  value={formData.min_experience}
                  onValueChange={(value) =>
                    setFormData({ ...formData, min_experience: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Additional Requirements
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a requirement..."
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddRequirement();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddRequirement}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {formData.requirements.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {formData.requirements.map((req, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg"
                      >
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {req}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveRequirement(index)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-text-main dark:text-white mb-4">
              What&apos;s Included
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.accommodations_provided}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      accommodations_provided: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Home className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Accommodation
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.travel_covered}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      travel_covered: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Plane className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Travel
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.meals_included}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      meals_included: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Utensils className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Meals
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.promo_support}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      promo_support: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Megaphone className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Promo
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.studio_perks}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      studio_perks: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Award className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Studio Perks
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.local_transport}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      local_transport: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Car className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Transport
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.content_provided}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      content_provided: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Camera className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Content
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.public_event}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      public_event: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Globe className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Public Event
                </span>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Plane className="w-4 h-4 mr-2" />
                  Post Guest Spot
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
