"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { ChevronDown, Grid3x3, List, RefreshCw, Users } from "lucide-react";
import { useSearchParams } from "next/navigation";
import InstructorCard from "./_components/InstructorCard";
import FilterSidebar from "./_components/FilterSidebar";
import InviteModal from "./_components/InviteModal";
import { Profile } from "@/types";
import { getInstructors, subscribeToInstructors, InstructorFilters } from "@/services/talentService";
import { Button } from "@/components/ui/button";

function InstructorsContent() {
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [instructors, setInstructors] = useState<Profile[]>([]);
  const [filteredInstructors, setFilteredInstructors] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<InstructorFilters>({});
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState<Profile | null>(null);

  useEffect(() => {
    const styleParam = searchParams.get("styles");
    const certParam = searchParams.get("certifications");
    const newFilters: InstructorFilters = {};

    if (styleParam) {
      newFilters.styles = styleParam.split(",").map(s => s.trim());
    }
    
    if (certParam) {
      newFilters.certifications = certParam.split(",").map(s => s.trim());
    }
    
    if (Object.keys(newFilters).length > 0) {
       setFilters(prev => ({ ...prev, ...newFilters }));
    }
  }, [searchParams]);

  const handleInvite = (instructor: Profile) => {
    setSelectedInstructor(instructor);
    setInviteModalOpen(true);
  };

  // Load instructors from Firebase
  const loadInstructors = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { instructors: data } = await getInstructors({
        ...filters,
        limitCount: 50,
      });
      
      setInstructors(data);
      setFilteredInstructors(data);
    } catch (err) {
      console.error("Error loading instructors:", err);
      setError("Failed to load instructors. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Initial load and subscribe to real-time updates
  useEffect(() => {
    loadInstructors();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToInstructors(
      (data) => {
        setInstructors(data);
        applyFilters(data, filters);
        setIsLoading(false);
      },
      { openToWork: filters.openToWork, limitCount: 50 }
    );

    return () => unsubscribe();
  }, []);

  // Apply filters when they change
  useEffect(() => {
    applyFilters(instructors, filters);
  }, [filters, instructors]);

  const applyFilters = (data: Profile[], currentFilters: InstructorFilters) => {
    let filtered = [...data];

    // Location filter
    if (currentFilters.location) {
      const locationLower = currentFilters.location.toLowerCase();
      filtered = filtered.filter(
        (inst) => inst.location?.toLowerCase().includes(locationLower)
      );
    }

    // Styles filter
    if (currentFilters.styles && currentFilters.styles.length > 0) {
      filtered = filtered.filter((inst) =>
        inst.fitness_styles?.some((style) => currentFilters.styles!.includes(style))
      );
    }

    // Certifications filter
    if (currentFilters.certifications && currentFilters.certifications.length > 0) {
      filtered = filtered.filter((inst) =>
        inst.certifications?.some((cert) => currentFilters.certifications!.includes(cert))
      );
    }

    // Open to work filter
    if (currentFilters.openToWork !== undefined) {
      filtered = filtered.filter((inst) => inst.open_to_work === currentFilters.openToWork);
    }

    // Open to guest spots filter
    if (currentFilters.openToGuestSpots !== undefined) {
      filtered = filtered.filter((inst) => inst.open_to_guest_spots === currentFilters.openToGuestSpots);
    }

    // Touring ready filter
    if (currentFilters.touringReady !== undefined) {
      filtered = filtered.filter((inst) => inst.touring_ready === currentFilters.touringReady);
    }

    // Rating filter
    if (currentFilters.minRating) {
      filtered = filtered.filter((inst) => (inst.rating || 0) >= currentFilters.minRating!);
    }

    // Experience filter
    if (currentFilters.minExperience) {
      filtered = filtered.filter(
        (inst) => (inst.years_of_experience || 0) >= currentFilters.minExperience!
      );
    }

    // Sort
    switch (currentFilters.sortBy) {
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "experience":
        filtered.sort((a, b) => (b.years_of_experience || 0) - (a.years_of_experience || 0));
        break;
      case "views":
        filtered.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
        break;
      case "recent":
      default:
        // Keep default order (by created_at desc from Firebase)
        break;
    }

    setFilteredInstructors(filtered);
  };

  const handleFilterChange = (newFilters: Partial<InstructorFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
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
              <Button
                variant="outline"
                size="sm"
                onClick={loadInstructors}
                disabled={isLoading}
                className="w-fit"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
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
                  <button 
                    onClick={() => handleFilterChange({ sortBy: filters.sortBy === "rating" ? "recent" : "rating" })}
                    className="flex items-center gap-1 text-sm font-bold text-text-main dark:text-white hover:text-primary transition-colors"
                  >
                    {filters.sortBy === "rating" ? "Top Rated" : 
                     filters.sortBy === "experience" ? "Experience" :
                     filters.sortBy === "views" ? "Most Viewed" : "Recommended"}
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
            {isLoading ? (
              <div className="flex flex-col justify-center items-center h-64 gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-600"></div>
                <p className="text-gray-500 dark:text-gray-400">Loading instructors...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <p className="text-red-500 text-center">{error}</p>
                <Button onClick={loadInstructors} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            ) : filteredInstructors.length > 0 ? (
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
                    onInvite={handleInvite}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark">
                <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No instructors found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Try adjusting your filters or check back later.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setFilters({})}
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Invite Modal */}
      {selectedInstructor && (
        <InviteModal
          isOpen={inviteModalOpen}
          onClose={() => {
            setInviteModalOpen(false);
            setSelectedInstructor(null);
          }}
          instructor={selectedInstructor}
        />
      )}
    </div>
  );
}

export default function InstructorsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <InstructorsContent />
    </Suspense>
  );
}
