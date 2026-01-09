import { Profile } from "@/types";
import Link from "next/link";
import { Star, Clock, MapPin, Bookmark } from "lucide-react";
import Image from "next/image";

interface InstructorCardProps {
  instructor: Profile;
  viewMode?: "grid" | "list";
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export default function InstructorCard({
  instructor,
  viewMode = "grid",
}: InstructorCardProps) {
  const isAvailable = instructor.open_to_work !== false;
  const profilePhoto =
    instructor.profile_photo || "https://via.placeholder.com/300";
  const initials = getInitials(instructor.full_name || "IN");

  if (viewMode === "list") {
    return (
      <div className="group bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-5 hover:shadow-lg hover:border-primary/30 transition-all duration-300 flex items-start gap-6">
        <div className="relative shrink-0">
          <div
            className="size-20 rounded-full bg-cover bg-center"
            style={{ backgroundImage: `url('${profilePhoto}')` }}
          />
          {isAvailable && (
            <div className="absolute -bottom-1 -right-1 bg-white dark:bg-surface-dark p-0.5 rounded-full">
              <div className="bg-primary size-4 rounded-full border-2 border-white dark:border-surface-dark"></div>
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-bold text-text-main dark:text-white group-hover:text-primary transition-colors">
                {instructor.full_name}
              </h3>
              <p className="text-sm text-text-muted">{instructor.headline}</p>
              <div className="flex items-center gap-1 text-sm text-text-muted mt-1">
                <Star size={16} className="text-yellow-500 fill-current" />
                <span className="font-bold text-text-main dark:text-white">
                  {instructor.rating || 0}
                </span>
                <span>({instructor.review_count || 0})</span>
              </div>
            </div>
            <button className="text-text-muted hover:text-primary transition-colors shrink-0">
              <Bookmark size={20} />
            </button>
          </div>

          <div className="flex items-center gap-4 text-sm text-text-muted mb-3">
            <div className="flex items-center gap-1">
              <MapPin size={18} />
              <span>{instructor.location || "Not specified"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={18} />
              <span>
                {instructor.availability_slots?.length
                  ? `${instructor.availability_slots.length} slots`
                  : "Check availability"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {instructor.fitness_styles?.slice(0, 3).map((style) => (
              <span
                key={style}
                className="px-2 py-1 rounded-md bg-background-light dark:bg-background-dark text-xs font-semibold text-text-main dark:text-white border border-border-light dark:border-border-dark"
              >
                {style}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link href={`/instructors/${instructor.id}`}>
              <button className="w-full flex items-center justify-center h-10 rounded-lg border border-border-light dark:border-border-dark bg-transparent hover:bg-background-light dark:hover:bg-background-dark text-sm font-bold text-text-main dark:text-white transition-colors">
                View Profile
              </button>
            </Link>
            <button
              disabled={!isAvailable}
              className={`w-full flex items-center justify-center h-10 rounded-lg text-sm font-bold transition-colors shadow-sm ${
                isAvailable
                  ? "bg-primary hover:bg-primary-hover text-[#111813]"
                  : "bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
              }`}
            >
              {isAvailable ? "Invite" : "Unavailable"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-6 hover:shadow-xl hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full ">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="size-16 rounded-full overflow-hidden bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shrink-0">
              <img
                src={profilePhoto}
                alt={instructor.full_name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <span className="text-lg font-bold text-white hidden">{initials}</span>
            </div>
            {isAvailable && (
              <div className="absolute -bottom-1 -right-1 bg-white dark:bg-surface-dark p-0.5 rounded-full">
                <div className="bg-primary size-4 rounded-full border-2 border-white dark:border-surface-dark"></div>
              </div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-main dark:text-white leading-tight group-hover:text-primary transition-colors">
              {instructor.full_name}
            </h3>
            <div className="flex items-center gap-1 text-sm text-text-muted mt-1">
              <Star size={16} className="text-yellow-500 fill-current" />
              <span className="font-bold text-text-main dark:text-white">
                {instructor.rating || 0}
              </span>
              <span>({instructor.review_count || 0})</span>
            </div>
          </div>
        </div>
        <button className="text-text-muted hover:text-primary transition-colors">
          <Bookmark size={20} />
        </button>
      </div>

      <div className="mb-6 space-y-4 flex-1">
        <div className="flex flex-wrap gap-2">
          {instructor.fitness_styles?.slice(0, 2).map((style) => (
            <span
              key={style}
              className="px-2 py-1 rounded-md bg-background-light dark:bg-background-dark text-xs font-semibold text-text-main dark:text-white border border-border-light dark:border-border-dark"
            >
              {style}
            </span>
          ))}
        </div>

        {instructor.availability_slots &&
          instructor.availability_slots.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <Clock size={18} />
              <span>Available Soon</span>
            </div>
          )}

        <div className="flex items-center gap-2 text-sm text-text-muted">
          <MapPin size={18} />
          <span>{instructor.location || "Not specified"}</span>
        </div>

        <p className="text-sm text-text-muted line-clamp-2">{instructor.bio}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link href={`/instructors/${instructor.id}`}>
          <button className="w-full flex items-center justify-center h-10 rounded-lg border border-border-light dark:border-border-dark bg-transparent hover:bg-background-light dark:hover:bg-background-dark text-sm font-bold text-text-main dark:text-white transition-colors">
            View Profile
          </button>
        </Link>
        <button
          disabled={!isAvailable}
          className={`w-full flex items-center justify-center h-10 rounded-lg text-sm font-bold transition-colors shadow-sm ${
            isAvailable
              ? "bg-primary hover:bg-primary-hover text-[#111813]"
              : "bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
          }`}
        >
          {isAvailable ? "Invite" : "Unavailable"}
        </button>
      </div>
    </div>
  );
}
