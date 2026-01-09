import { Profile } from "@/types";
import Link from "next/link";
import { Star, MapPin, Bookmark, MapPinIcon } from "lucide-react";

interface StudioCardProps {
  studio: Profile;
  viewMode?: "grid" | "list";
}

export default function StudioCard({
  studio,
  viewMode = "grid",
}: StudioCardProps) {
  const studioImage = studio.images?.[0] || "https://via.placeholder.com/400";

  if (viewMode === "list") {
    return (
      <div className="group bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-5 hover:shadow-lg hover:border-primary/30 transition-all duration-300 flex items-start gap-6">
        <div className="relative shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800">
          <img
            src={studioImage}
            alt={studio.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-bold text-text-main dark:text-white group-hover:text-primary transition-colors">
                {studio.name}
              </h3>
              <p className="text-sm text-text-muted">{studio.tagline}</p>
              <div className="flex items-center gap-1 text-sm text-text-muted mt-1">
                <Star size={16} className="text-yellow-500 fill-current" />
                <span className="font-bold text-text-main dark:text-white">
                  {studio.rating || 0}
                </span>
                <span>({studio.review_count || 0})</span>
              </div>
            </div>
            <button className="text-text-muted hover:text-primary transition-colors shrink-0">
              <Bookmark size={20} />
            </button>
          </div>

          <div className="flex items-center gap-4 text-sm text-text-muted mb-3">
            <div className="flex items-center gap-1">
              <MapPin size={18} />
              <span>{studio.location || "Not specified"}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {studio.styles?.slice(0, 3).map((style) => (
              <span
                key={style}
                className="px-2 py-1 rounded-md bg-background-light dark:bg-background-dark text-xs font-semibold text-text-main dark:text-white border border-border-light dark:border-border-dark"
              >
                {style}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link href={`/studios/${studio.id}`}>
              <button className="w-full flex items-center justify-center h-10 rounded-lg border border-border-light dark:border-border-dark bg-transparent hover:bg-background-light dark:hover:bg-background-dark text-sm font-bold text-text-main dark:text-white transition-colors">
                View Studio
              </button>
            </Link>
            <button className="w-full flex items-center justify-center h-10 rounded-lg bg-primary hover:bg-primary-hover text-[#111813] text-sm font-bold transition-colors shadow-sm">
              Contact
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark overflow-hidden hover:shadow-xl hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      {/* Image */}
      <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-800 overflow-hidden">
        <img
          src={studioImage}
          alt={studio.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3">
          <button className="bg-white dark:bg-surface-dark p-2 rounded-full shadow-md hover:shadow-lg transition-shadow">
            <Bookmark size={18} className="text-text-muted hover:text-primary" />
          </button>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-text-main dark:text-white group-hover:text-primary transition-colors leading-tight mb-1">
            {studio.name}
          </h3>
          <p className="text-sm text-text-muted mb-2">{studio.tagline}</p>
          <div className="flex items-center gap-1 text-sm text-text-muted">
            <Star size={16} className="text-yellow-500 fill-current" />
            <span className="font-bold text-text-main dark:text-white">
              {studio.rating || 0}
            </span>
            <span>({studio.review_count || 0})</span>
          </div>
        </div>

        {/* Info */}
        <div className="mb-4 flex-1 space-y-3">
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <MapPin size={18} />
            <span>{studio.location || "Not specified"}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {studio.styles?.slice(0, 2).map((style) => (
              <span
                key={style}
                className="px-2 py-1 rounded-md bg-background-light dark:bg-background-dark text-xs font-semibold text-text-main dark:text-white border border-border-light dark:border-border-dark"
              >
                {style}
              </span>
            ))}
          </div>

          <p className="text-sm text-text-muted line-clamp-2">
            {studio.description}
          </p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border-light dark:border-border-dark">
          <Link href={`/studios/${studio.id}`}>
            <button className="w-full flex items-center justify-center h-10 rounded-lg border border-border-light dark:border-border-dark bg-transparent hover:bg-background-light dark:hover:bg-background-dark text-sm font-bold text-text-main dark:text-white transition-colors">
              View Studio
            </button>
          </Link>
          <button className="w-full flex items-center justify-center h-10 rounded-lg bg-primary hover:bg-primary-hover text-[#111813] text-sm font-bold transition-colors shadow-sm">
            Contact
          </button>
        </div>
      </div>
    </div>
  );
}
