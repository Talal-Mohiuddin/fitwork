"use client";

import { useState } from "react";
import { ChevronDown, Grid3x3, List } from "lucide-react";
import { instructors } from "@/data";
import InstructorCard from "./_components/InstructorCard";
import FilterSidebar from "./_components/FilterSidebar";

export default function InstructorsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filteredInstructors, setFilteredInstructors] = useState(instructors);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const handleFilterChange = (filters: any) => {
    // Filter logic would go here
    setFilteredInstructors(instructors);
  };

  return (
    <div className="flex flex-1 overflow-hidden h-[calc(100vh-65px)] max-w-7xl mx-auto">
      {/* Sidebar Filters */}
      <FilterSidebar onFilterChange={handleFilterChange} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Page Header & Sort */}
        <div className="px-6 pt-8 pb-4 lg:px-10 shrink-0">
          <div className="max-w-[1200px] mx-auto w-full">
            {/* Heading */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl lg:text-4xl font-black text-text-main dark:text-white tracking-tight mb-2">
                  Discover Talent
                </h1>
                <p className="text-text-muted text-base lg:text-lg">
                  Find the perfect instructor for your studio in minutes.
                </p>
              </div>
            </div>

            {/* Sort Bar */}
            <div className="flex items-center justify-between py-3 ">
              <p className="text-sm font-medium text-text-muted">
                <span className="text-text-main dark:text-white font-bold">
                  {filteredInstructors.length}
                </span>{" "}
                Instructors found
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-text-muted hidden sm:inline">
                    Sort by:
                  </span>
                  <button className="flex items-center gap-1 text-sm font-bold text-text-main dark:text-white hover:text-primary transition-colors">
                    Recommended
                    <ChevronDown size={18} />
                  </button>
                </div>
                <div className="flex  dark:bg-gray-800 rounded-lg p-0.5 gap-5">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-md ${
                      viewMode === "grid"
                        ? "bg-white dark:bg-surface-dark shadow-sm text-text-main dark:text-white"
                        : "text-text-muted hover:text-text-main dark:hover:text-white"
                    }`}
                  >
                    <Grid3x3 size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-md ${
                      viewMode === "list"
                        ? "bg-white dark:bg-surface-dark shadow-sm text-text-main dark:text-white"
                        : "text-text-muted hover:text-text-main dark:hover:text-white"
                    }`}
                  >
                    <List size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Grid Area */}
        <div className="flex-1 overflow-y-auto px-6 pb-10 lg:px-10 custom-scrollbar">
          <div className="w-full max-w-[1400px] mx-auto">
            <div
          
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-3 gap-6 pt-4"
                  : "flex flex-col gap-4 pt-4"
              }
            >
              {filteredInstructors.map((instructor) => (
                <InstructorCard
                  key={instructor.id}
                  instructor={instructor}
                  viewMode={viewMode}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
