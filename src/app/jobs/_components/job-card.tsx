import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { JobWithStudio } from "@/types";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { Calendar, DollarSign, Zap, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import JobApplicationSheet from "./job-application-sheet";

export default function JobCard({ job }: { job: JobWithStudio }) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const router = useRouter();
  const logoUrl = job.studio?.images?.[0];

  // Calculate match percentage (mock calculation based on styles)
  const matchPercentage = Math.floor(Math.random() * (98 - 85 + 1) + 85);
  const isUrgent = formatDistanceToNow(new Date(job.created_at)).includes(
    "less than"
  );

  return (
    <>
      <div className="group relative flex flex-col sm:flex-row items-stretch gap-4 rounded-xl bg-white dark:bg-[#1a2c35] p-5 shadow-sm hover:shadow-md border border-transparent hover:border-green-600/20 transition-all duration-300 cursor-pointer">
        {/* Match Badge */}
        <div
          className={`absolute top-5 right-5 flex items-center gap-1.5 px-2 py-1 rounded-md ${
            matchPercentage >= 95
              ? "bg-green-50 dark:bg-green-900/30"
              : matchPercentage >= 90
              ? "bg-green-50 dark:bg-green-900/30"
              : "bg-gray-50 dark:bg-gray-800"
          }`}
        >
          {matchPercentage >= 90 && (
            <CheckCircle
              className={`w-4 h-4 ${
                matchPercentage >= 95
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            />
          )}
          <span
            className={`text-xs font-bold ${
              matchPercentage >= 95
                ? "text-green-700 dark:text-green-300"
                : matchPercentage >= 90
                ? "text-green-700 dark:text-green-300"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            {matchPercentage}% Match
          </span>
        </div>

        {/* Urgent Badge */}
        {isUrgent && (
          <div className="absolute top-5 right-24 flex items-center gap-1.5 bg-orange-50 dark:bg-orange-900/30 px-2 py-1 rounded-md border border-orange-100 dark:border-orange-800/50">
            <Zap className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <span className="text-orange-700 dark:text-orange-300 text-xs font-bold">
              Urgent
            </span>
          </div>
        )}

        {/* Studio Image */}
        <div className="w-full sm:w-48 aspect-video sm:aspect-[4/3] rounded-lg bg-gray-100 dark:bg-gray-800 shrink-0 overflow-hidden">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={job.studio?.name || "Studio"}
              width={400}
              height={300}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {job.studio?.name?.[0] || "F"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-gray-600 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">
                {job.studio?.name || "Studio"}
              </p>
              <span className="size-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
              <p className="text-gray-600 dark:text-gray-400 text-xs">
                {job.studio?.location || "Location TBD"}
              </p>
            </div>
            <h3 className="text-gray-900 dark:text-white text-xl font-bold leading-tight mb-2 group-hover:text-green-600 transition-colors">
              {job.position}
            </h3>
            <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span>{new Date(job.start_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="font-semibold text-gray-900 dark:text-white">
                  {job.compensation}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-end justify-between mt-2">
            <div className="flex gap-2 flex-wrap">
              {job.styles?.slice(0, 2).map((style) => (
                <span
                  key={style}
                  className="px-2 py-1 rounded bg-gray-100 dark:bg-[#253842] text-gray-900 dark:text-gray-200 text-xs font-medium"
                >
                  {style}
                </span>
              ))}
            </div>
            <Button
              onClick={() => setIsSheetOpen(true)}
              className="h-9 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-green-600/20"
            >
              <span>Apply</span>
              <span>→</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Sheet Component */}
      <JobApplicationSheet
        job={job}
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      />
    </>
  );
}
