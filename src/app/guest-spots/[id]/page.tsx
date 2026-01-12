"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  DollarSign,
  Home,
  Plane,
  Utensils,
  Clock,
  Users,
  Check,
  X,
  Loader2,
  Share2,
  Building2,
  Award,
  Megaphone,
  Car,
  Camera,
  Globe,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { GuestSpotWithStudio, GuestSpotApplicationStatus } from "@/types";
import {
  getGuestSpotById,
  applyToGuestSpot,
  getGuestSpotApplicationStatus,
} from "@/services/guestSpotService";
import { useAuth } from "@/store/firebase-auth-provider";

const durationLabels: Record<string, string> = {
  single_class: "Single Class",
  workshop: "Workshop",
  weekend: "Weekend",
  week: "Week",
  retreat: "Retreat",
  series: "Series",
};

export default function GuestSpotDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  const guestSpotId = params?.id as string;

  const [guestSpot, setGuestSpot] = useState<GuestSpotWithStudio | null>(null);
  const [loading, setLoading] = useState(true);
  const [applicationStatus, setApplicationStatus] =
    useState<GuestSpotApplicationStatus | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState("");
  const [proposedRate, setProposedRate] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGuestSpot = async () => {
      try {
        setLoading(true);
        const data = await getGuestSpotById(guestSpotId);
        setGuestSpot(data);

        // Check if user has already applied
        if (user) {
          const status = await getGuestSpotApplicationStatus(guestSpotId, user.uid);
          setApplicationStatus(status);
        }
      } catch (err) {
        console.error("Error fetching guest spot:", err);
        setError("Failed to load guest spot details");
      } finally {
        setLoading(false);
      }
    };

    if (guestSpotId) {
      fetchGuestSpot();
    }
  }, [guestSpotId, user]);

  const handleApply = async () => {
    if (!user || !profile) {
      router.push(`/login?redirect=/guest-spots/${guestSpotId}`);
      return;
    }

    if (profile.user_type !== "instructor") {
      setError("Only instructors can apply to guest spots");
      return;
    }

    if (!profile.profile_completed) {
      setError("Please complete your profile before applying");
      return;
    }

    setIsApplying(true);
    try {
      await applyToGuestSpot(
        guestSpotId,
        user.uid,
        applicationMessage || undefined,
        proposedRate || undefined
      );
      setApplicationStatus({ hasApplied: true, status: "pending" });
      setShowApplicationForm(false);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to submit application";
      setError(errorMessage);
    } finally {
      setIsApplying(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!guestSpot) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Guest Spot Not Found
          </h2>
          <Link href="/guest-spots">
            <Button>Browse Guest Spots</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/guest-spots"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-primary mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Guest Spots
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <div className="relative h-64 md:h-80 rounded-xl overflow-hidden bg-linear-to-br from-primary/20 to-purple-500/20">
              {guestSpot.studio.images && guestSpot.studio.images[0] ? (
                <Image
                  src={guestSpot.studio.images[0]}
                  alt={guestSpot.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Plane className="w-24 h-24 text-primary/30" />
                </div>
              )}
              {/* Duration Badge */}
              <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {durationLabels[guestSpot.duration_type] || guestSpot.duration_type}
                </span>
              </div>
              {/* Status Badge */}
              <div
                className={`absolute top-4 right-4 px-3 py-1.5 rounded-full ${
                  guestSpot.status === "open"
                    ? "bg-green-500 text-white"
                    : guestSpot.status === "filled"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-500 text-white"
                }`}
              >
                <span className="text-sm font-medium capitalize">{guestSpot.status}</span>
              </div>
            </div>

            {/* Title Section */}
            <div>
              <Link
                href={`/studios/${guestSpot.studio_id}`}
                className="text-primary font-medium hover:underline"
              >
                {guestSpot.studio.name}
              </Link>
              <h1 className="text-3xl font-bold text-text-main dark:text-white mt-2">
                {guestSpot.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-4 text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>{guestSpot.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>
                    {formatDate(guestSpot.start_date)} - {formatDate(guestSpot.end_date)}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-text-main dark:text-white mb-4">
                About This Opportunity
              </h2>
              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                {guestSpot.description}
              </p>
            </div>

            {/* Styles */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-text-main dark:text-white mb-4">
                Fitness Styles
              </h2>
              <div className="flex flex-wrap gap-2">
                {guestSpot.styles.map((style) => (
                  <span
                    key={style}
                    className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium"
                  >
                    {style}
                  </span>
                ))}
              </div>
            </div>

            {/* Requirements */}
            {guestSpot.requirements && guestSpot.requirements.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-text-main dark:text-white mb-4">
                  Requirements
                </h2>
                <ul className="space-y-2">
                  {guestSpot.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                      <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
                {guestSpot.min_experience && (
                  <p className="mt-4 text-gray-500 dark:text-gray-400">
                    <strong>Minimum Experience:</strong> {guestSpot.min_experience}
                  </p>
                )}
              </div>
            )}

            {/* Benefits */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-text-main dark:text-white mb-4">
                What&apos;s Included
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {guestSpot.accommodations_provided && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <Home className="w-5 h-5" />
                    <span>Accommodation</span>
                  </div>
                )}
                {guestSpot.travel_covered && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <Plane className="w-5 h-5" />
                    <span>Travel Covered</span>
                  </div>
                )}
                {guestSpot.meals_included && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <Utensils className="w-5 h-5" />
                    <span>Meals Included</span>
                  </div>
                )}
                {guestSpot.promo_support && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <Megaphone className="w-5 h-5" />
                    <span>Promo Support</span>
                  </div>
                )}
                {guestSpot.studio_perks && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <Award className="w-5 h-5" />
                    <span>Studio Perks</span>
                  </div>
                )}
                {guestSpot.local_transport && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <Car className="w-5 h-5" />
                    <span>Local Transport</span>
                  </div>
                )}
                {guestSpot.content_provided && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <Camera className="w-5 h-5" />
                    <span>Content Provided</span>
                  </div>
                )}
                {guestSpot.public_event && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <Globe className="w-5 h-5" />
                    <span>Public Event</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Apply Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-6 h-6 text-primary" />
                <span className="text-2xl font-bold text-text-main dark:text-white">
                  {guestSpot.compensation}
                </span>
              </div>

              {guestSpot.application_count !== undefined && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  <Users className="w-4 h-4 inline mr-1" />
                  {guestSpot.application_count} applicant
                  {guestSpot.application_count !== 1 ? "s" : ""}
                </p>
              )}

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              {applicationStatus?.hasApplied ? (
                <div className="text-center">
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                      applicationStatus.status === "accepted"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : applicationStatus.status === "rejected"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : applicationStatus.status === "invited"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }`}
                  >
                    {applicationStatus.status === "accepted" && <Check className="w-4 h-4" />}
                    {applicationStatus.status === "rejected" && <X className="w-4 h-4" />}
                    {applicationStatus.status === "pending" && <Clock className="w-4 h-4" />}
                    Application {applicationStatus.status}
                  </div>
                </div>
              ) : guestSpot.status !== "open" ? (
                <Button className="w-full" disabled>
                  {guestSpot.status === "filled" ? "Position Filled" : "No Longer Available"}
                </Button>
              ) : showApplicationForm ? (
                <div className="space-y-4">
                  <Textarea
                    placeholder="Tell the studio why you're a great fit for this guest spot..."
                    value={applicationMessage}
                    onChange={(e) => setApplicationMessage(e.target.value)}
                    rows={4}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Proposed Rate (optional)
                    </label>
                    <Input
                      placeholder="e.g., $500/day"
                      value={proposedRate}
                      onChange={(e) => setProposedRate(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowApplicationForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 bg-primary hover:bg-primary-dark text-white"
                      onClick={handleApply}
                      disabled={isApplying}
                    >
                      {isApplying ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Applying...
                        </>
                      ) : (
                        "Submit Application"
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  className="w-full bg-primary hover:bg-primary-dark text-white font-bold"
                  onClick={() => {
                    if (!user) {
                      router.push(`/login?redirect=/guest-spots/${guestSpotId}`);
                    } else {
                      setShowApplicationForm(true);
                    }
                  }}
                >
                  Apply Now
                </Button>
              )}

              {/* Studio Info */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Link href={`/studios/${guestSpot.studio_id}`}>
                  <div className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded-lg transition-colors">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                      {guestSpot.studio.images && guestSpot.studio.images[0] ? (
                        <Image
                          src={guestSpot.studio.images[0]}
                          alt={guestSpot.studio.name || "Studio"}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <Building2 className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-text-main dark:text-white">
                        {guestSpot.studio.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {guestSpot.studio.location}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Share Button */}
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                }}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share This Opportunity
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
