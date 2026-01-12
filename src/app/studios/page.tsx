"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Grid3x3, List, Loader2 } from "lucide-react";
import StudioCard from "./_components/StudioCard";
import FilterSidebar from "./_components/FilterSidebar";
import { getStudios } from "@/services/studioService";
import { Profile } from "@/types";

export default function StudiosPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [allStudios, setAllStudios] = useState<Profile[]>([]);
  const [filteredStudios, setFilteredStudios] = useState<Profile[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch studios from Firebase
  useEffect(() => {
    const fetchStudios = async () => {
      try {
        setLoading(true);
        const { studios } = await getStudios({ sortBy: "recent" });
        setAllStudios(studios);
        setFilteredStudios(studios);
      } catch (err) {
        console.error("Error fetching studios:", err);
        setError("Failed to load studios. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudios();
  }, []);

  const handleFilterChange = (filters: any) => {
    let filtered = [...allStudios];

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (studio) =>
          studio.name?.toLowerCase().includes(search) ||
          studio.description?.toLowerCase().includes(search)
      );
    }

    if (filters.location && filters.location.length > 0) {
      filtered = filtered.filter((studio) =>
        filters.location.some((loc: string) =>
          studio.location?.toLowerCase().includes(loc.toLowerCase())
        )
      );
    }

    if (filters.styles && filters.styles.length > 0) {
      filtered = filtered.filter((studio) =>
        studio.styles?.some((style) => filters.styles.includes(style))
      );
    }

    if (filters.amenities && filters.amenities.length > 0) {
      filtered = filtered.filter((studio) =>
        filters.amenities.every((amenity: string) =>
          studio.amenities?.includes(amenity)
        )
      );
    }

    if (filters.minRating) {
      filtered = filtered.filter(
        (studio) => (studio.rating || 0) >= filters.minRating
      );
    }

    // Sort logic
    if (filters.sortBy === "rating") {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (filters.sortBy === "newest") {
      filtered.sort(
        (a, b) =>
          new Date(b.created_at || "").getTime() -
          new Date(a.created_at || "").getTime()
      );
    } else if (filters.sortBy === "views") {
      filtered.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
    }

    setFilteredStudios(filtered);
  };

  return (
    <div className="flex flex-1 overflow-hidden h-[calc(100vh-65px)] max-w-7xl mx-auto">
      {/* Sidebar Filters */}
      <FilterSidebar onFilterChange={handleFilterChange} studios={allStudios} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Page Header & Sort */}
        <div className="px-6 pt-8 pb-4 lg:px-10 shrink-0">
          <div className="max-w-[1200px] mx-auto w-full">
            {/* Heading */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl lg:text-4xl font-black text-text-main dark:text-white tracking-tight mb-2">
                  Find Your Studio
                </h1>
                <p className="text-text-muted text-base lg:text-lg">
                  Discover fitness studios that match your style and needs.
                </p>
              </div>
            </div>

            {/* Sort Bar */}
            <div className="flex items-center justify-between py-3">
              <p className="text-sm font-medium text-text-muted">
                <span className="text-text-main dark:text-white font-bold">
                  {filteredStudios.length}
                </span>{" "}
                Studios found
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
                <div className="flex dark:bg-gray-800 rounded-lg p-0.5 gap-5">
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
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-primary text-[#111813] rounded-lg font-bold hover:bg-primary-hover transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : filteredStudios.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <p className="text-text-muted text-lg mb-2">No studios found</p>
                <p className="text-text-muted text-sm">Try adjusting your filters</p>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-3 gap-6 pt-4"
                    : "flex flex-col gap-4 pt-4"
                }
              >
                {filteredStudios.map((studio) => (
                  <StudioCard
                    key={studio.id}
                    studio={studio}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
