"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  MapPin,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  SortAsc,
  X,
  RefreshCw,
  Plane,
  Calendar,
  Home,
} from "lucide-react";
import { useEffect, useState, useMemo, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { GuestSpotWithStudio } from "@/types";
import GuestSpotCard from "./_components/guest-spot-card";
import { getGuestSpots, subscribeToGuestSpots } from "@/services/guestSpotService";
import { useAuth } from "@/store/firebase-auth-provider";
import Link from "next/link";

const disciplineOptions = [
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
  "Reformer Pilates / Megaformer (Lagree)",
  "Breathwork",
  "Barre",
  "Dance Fitness (Latin, Afrobeat, Hip-Hop, etc.)",
  "Step Aerobics",
  "Pole Fitness / Aerial",
  "Spinning (classic)",
  "Rhythm Ride / Cycle (music-based)",
  "Running Coaching",
  "Aqua Fitness",
  "Bootcamp / Outdoor Conditioning",
];

const durationOptions = [
  { label: "All Durations", value: "all" },
  { label: "Single Class", value: "single_class" },
  { label: "Workshop", value: "workshop" },
  { label: "Weekend", value: "weekend" },
  { label: "Week", value: "week" },
  { label: "Retreat", value: "retreat" },
  { label: "Series", value: "series" },
];

interface FilterState {
  searchTerm: string;
  location: string;
  selectedCategories: string[];
  selectedDuration: string;
  sortBy: string;
  accommodationsOnly: boolean;
  travelCoveredOnly: boolean;
}

function GuestSpotListingContent() {
  const searchParams = useSearchParams();
  const { user, profile } = useAuth();

  const [allGuestSpots, setAllGuestSpots] = useState<GuestSpotWithStudio[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const guestSpotsPerPage = 12;

  const initialFilters: FilterState = {
    searchTerm: searchParams?.get("search") || "",
    location: searchParams?.get("location") || "",
    selectedCategories: searchParams?.get("styles")?.split(",").filter(Boolean) || [],
    selectedDuration: searchParams?.get("duration") || "all",
    sortBy: "latest",
    accommodationsOnly: searchParams?.get("accommodations") === "true",
    travelCoveredOnly: searchParams?.get("travel") === "true",
  };

  const [filters, setFilters] = useState<FilterState>(initialFilters);
  // Filters are always shown on desktop, could add mobile toggle later

  // Fetch guest spots
  useEffect(() => {
    const fetchGuestSpots = async () => {
      try {
        setLoading(true);
        const { guestSpots } = await getGuestSpots({ status: "open" });
        setAllGuestSpots(guestSpots);
      } catch (error) {
        console.error("Error fetching guest spots:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGuestSpots();

    // Set up real-time subscription
    const unsubscribe = subscribeToGuestSpots((guestSpots) => {
      setAllGuestSpots(guestSpots);
    });

    return () => unsubscribe();
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const { guestSpots } = await getGuestSpots({ status: "open" });
      setAllGuestSpots(guestSpots);
    } catch (error) {
      console.error("Error refreshing guest spots:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Filter and sort guest spots
  const filteredGuestSpots = useMemo(() => {
    let result = [...allGuestSpots];

    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      result = result.filter(
        (gs) =>
          gs.title.toLowerCase().includes(searchLower) ||
          gs.description?.toLowerCase().includes(searchLower) ||
          gs.studio.name?.toLowerCase().includes(searchLower) ||
          gs.styles.some((style) => style.toLowerCase().includes(searchLower))
      );
    }

    // Location filter
    if (filters.location) {
      const locationLower = filters.location.toLowerCase();
      result = result.filter(
        (gs) =>
          gs.location?.toLowerCase().includes(locationLower) ||
          gs.studio.location?.toLowerCase().includes(locationLower)
      );
    }

    // Category/Style filter
    if (filters.selectedCategories.length > 0) {
      result = result.filter((gs) =>
        gs.styles.some((style) => filters.selectedCategories.includes(style))
      );
    }

    // Duration filter
    if (filters.selectedDuration !== "all") {
      result = result.filter((gs) => gs.duration_type === filters.selectedDuration);
    }

    // Accommodations filter
    if (filters.accommodationsOnly) {
      result = result.filter((gs) => gs.accommodations_provided);
    }

    // Travel covered filter
    if (filters.travelCoveredOnly) {
      result = result.filter((gs) => gs.travel_covered);
    }

    // Sort
    switch (filters.sortBy) {
      case "oldest":
        result.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        break;
      case "start_date":
        result.sort(
          (a, b) =>
            new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
        );
        break;
      case "latest":
      default:
        result.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
    }

    return result;
  }, [allGuestSpots, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredGuestSpots.length / guestSpotsPerPage);
  const paginatedGuestSpots = filteredGuestSpots.slice(
    (currentPage - 1) * guestSpotsPerPage,
    currentPage * guestSpotsPerPage
  );

  const clearFilters = () => {
    setFilters({
      searchTerm: "",
      location: "",
      selectedCategories: [],
      selectedDuration: "all",
      sortBy: "latest",
      accommodationsOnly: false,
      travelCoveredOnly: false,
    });
    setCurrentPage(1);
  };

  const hasActiveFilters =
    filters.searchTerm ||
    filters.location ||
    filters.selectedCategories.length > 0 ||
    filters.selectedDuration !== "all" ||
    filters.accommodationsOnly ||
    filters.travelCoveredOnly;

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-text-main dark:text-white tracking-tight">
              Guest Spots
            </h1>
            <p className="text-text-sub dark:text-gray-400 mt-2">
              Discover traveling instructor opportunities at studios around the world
            </p>
          </div>
          {profile?.user_type === "studio" && (
            <Link href="/guest-spots/post">
              <Button className="bg-primary hover:bg-primary-dark text-white font-bold">
                <Plane className="w-4 h-4 mr-2" />
                Post Guest Spot
              </Button>
            </Link>
          )}
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search guest spots, studios, or styles..."
                className="pl-10"
                value={filters.searchTerm}
                onChange={(e) =>
                  setFilters({ ...filters, searchTerm: e.target.value })
                }
              />
            </div>

            {/* Location Input */}
            <div className="relative w-full lg:w-64">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Location"
                className="pl-10"
                value={filters.location}
                onChange={(e) =>
                  setFilters({ ...filters, location: e.target.value })
                }
              />
            </div>

            {/* Duration Filter */}
            <Select
              value={filters.selectedDuration}
              onValueChange={(value) =>
                setFilters({ ...filters, selectedDuration: value })
              }
            >
              <SelectTrigger className="w-full lg:w-48">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Duration" />
              </SelectTrigger>
              <SelectContent>
                {durationOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Styles Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full lg:w-auto">
                  Styles
                  {filters.selectedCategories.length > 0 && (
                    <span className="ml-2 bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                      {filters.selectedCategories.length}
                    </span>
                  )}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 max-h-80 overflow-y-auto">
                <DropdownMenuLabel>Fitness Styles</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {disciplineOptions.map((option) => (
                  <DropdownMenuCheckboxItem
                    key={option}
                    checked={filters.selectedCategories.includes(option)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFilters({
                          ...filters,
                          selectedCategories: [
                            ...filters.selectedCategories,
                            option,
                          ],
                        });
                      } else {
                        setFilters({
                          ...filters,
                          selectedCategories: filters.selectedCategories.filter(
                            (c) => c !== option
                          ),
                        });
                      }
                    }}
                  >
                    {option}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sort */}
            <Select
              value={filters.sortBy}
              onValueChange={(value) => setFilters({ ...filters, sortBy: value })}
            >
              <SelectTrigger className="w-full lg:w-40">
                <SortAsc className="w-4 h-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="start_date">Start Date</SelectItem>
              </SelectContent>
            </Select>

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>

          {/* Benefits Filters */}
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.accommodationsOnly}
                onChange={(e) =>
                  setFilters({ ...filters, accommodationsOnly: e.target.checked })
                }
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Home className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Accommodations Provided
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.travelCoveredOnly}
                onChange={(e) =>
                  setFilters({ ...filters, travelCoveredOnly: e.target.checked })
                }
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Plane className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Travel Covered
              </span>
            </label>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-500">Active filters:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-red-500 hover:text-red-600"
              >
                <X className="w-4 h-4 mr-1" />
                Clear all
              </Button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {paginatedGuestSpots.length} of {filteredGuestSpots.length} guest spots
          </p>
        </div>

        {/* Guest Spots Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-xl h-80 animate-pulse"
              />
            ))}
          </div>
        ) : paginatedGuestSpots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedGuestSpots.map((guestSpot) => (
              <GuestSpotCard key={guestSpot.id} guestSpot={guestSpot} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Plane className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
              No guest spots found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Try adjusting your filters or check back later for new opportunities.
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <span className="text-sm text-gray-500 dark:text-gray-400 px-4">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* CTA for non-authenticated users */}
        {!user && (
          <div className="mt-12 bg-linear-to-r from-primary/10 to-purple-500/10 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-text-main dark:text-white mb-4">
              Ready to explore guest teaching opportunities?
            </h3>
            <p className="text-text-sub dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              Create your instructor profile to apply for guest spots at studios around the world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup?mode=instructor">
                <Button className="bg-primary hover:bg-primary-dark text-white font-bold">
                  Sign Up as Instructor
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline">Log In</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GuestSpotsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      }
    >
      <GuestSpotListingContent />
    </Suspense>
  );
}
