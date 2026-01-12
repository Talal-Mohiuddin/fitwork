"use client";

import { GuestSpotWithStudio } from "@/types";
import {
  MapPin,
  Calendar,
  DollarSign,
  Home,
  Plane,
  Utensils,
  Users,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface GuestSpotCardProps {
  guestSpot: GuestSpotWithStudio;
}

const durationLabels: Record<string, string> = {
  single_class: "Single Class",
  workshop: "Workshop",
  weekend: "Weekend",
  week: "Week",
  retreat: "Retreat",
  series: "Series",
};

export default function GuestSpotCard({ guestSpot }: GuestSpotCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDaysUntil = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.ceil(
      (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff;
  };

  const daysUntil = getDaysUntil(guestSpot.start_date);

  return (
    <Link href={`/guest-spots/${guestSpot.id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
        {/* Image */}
        <div className="relative h-40 bg-linear-to-br from-primary/20 to-purple-500/20">
          {guestSpot.studio.images && guestSpot.studio.images[0] ? (
            <Image
              src={guestSpot.studio.images[0]}
              alt={guestSpot.studio.name || "Studio"}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Plane className="w-12 h-12 text-primary/50" />
            </div>
          )}
          {/* Duration Badge */}
          <div className="absolute top-3 left-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-2.5 py-1 rounded-full">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
              {durationLabels[guestSpot.duration_type] || guestSpot.duration_type}
            </span>
          </div>
          {/* Days Until Badge */}
          {daysUntil > 0 && daysUntil <= 14 && (
            <div className="absolute top-3 right-3 bg-orange-500 text-white px-2.5 py-1 rounded-full">
              <span className="text-xs font-medium">
                {daysUntil === 1 ? "Tomorrow" : `In ${daysUntil} days`}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Studio Name */}
          <p className="text-xs text-primary font-medium mb-1">
            {guestSpot.studio.name || "Studio"}
          </p>

          {/* Title */}
          <h3 className="text-lg font-bold text-text-main dark:text-white mb-2 line-clamp-2">
            {guestSpot.title}
          </h3>

          {/* Location & Dates */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="line-clamp-1">{guestSpot.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Calendar className="w-4 h-4 shrink-0" />
              <span>
                {formatDate(guestSpot.start_date)} - {formatDate(guestSpot.end_date)}
              </span>
            </div>
          </div>

          {/* Styles */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {guestSpot.styles.slice(0, 3).map((style) => (
              <span
                key={style}
                className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full"
              >
                {style}
              </span>
            ))}
            {guestSpot.styles.length > 3 && (
              <span className="text-gray-400 text-xs">
                +{guestSpot.styles.length - 3} more
              </span>
            )}
          </div>

          {/* Benefits */}
          <div className="flex flex-wrap gap-2 mb-4">
            {guestSpot.accommodations_provided && (
              <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <Home className="w-3.5 h-3.5" />
                <span>Housing</span>
              </div>
            )}
            {guestSpot.travel_covered && (
              <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                <Plane className="w-3.5 h-3.5" />
                <span>Travel</span>
              </div>
            )}
            {guestSpot.meals_included && (
              <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
                <Utensils className="w-3.5 h-3.5" />
                <span>Meals</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm font-semibold text-primary">
              <DollarSign className="w-4 h-4" />
              <span>{guestSpot.compensation}</span>
            </div>
            {guestSpot.application_count !== undefined && (
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Users className="w-3.5 h-3.5" />
                <span>{guestSpot.application_count} applicants</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
