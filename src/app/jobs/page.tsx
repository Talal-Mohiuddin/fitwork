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
  Map,
  SortAsc,
  Zap,
  CheckCircle,
  X,
} from "lucide-react";
import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { JobWithStudio } from "@/types";
import JobCard from "./_components/job-card";
import { jobs } from "@/data";

const extractLocationCity = (address: string): string => {
  if (!address) return "";
  const parts = address
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length > 1) {
    for (let i = 0; i < Math.min(3, parts.length); i++) {
      const part = parts[i];
      if (!/^\d+$/.test(part) && part.length > 3) {
        return part;
      }
    }
    return parts.find((part) => part.length > 3) || parts[0];
  }
  return parts[0];
};

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

const dateOptions = [
  { label: "All", value: "all" },
  { label: "Last 24 Hours", value: "last-24h" },
  { label: "Last 7 Days", value: "last-7d" },
  { label: "Last 30 Days", value: "last-30d" },
];

interface FilterState {
  searchTerm: string;
  location: string;
  selectedCategories: string[];
  selectedDatePosted: string;
  salaryRange: number[];
  sortBy: string;
  urgentOnly: boolean;
}

function JobListingContent() {
  const searchParams = useSearchParams();
  // const [allJobs, setAllJobs] = useState<JobWithStudio[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 10;

  const categoryFromUrl = searchParams.get("category");
  const locationFromUrl = searchParams.get("location");
  const searchFromUrl = searchParams.get("search");

  const [filters, setFilters] = useState<FilterState>({
    searchTerm: searchFromUrl || "",
    location: locationFromUrl || "",
    selectedCategories: categoryFromUrl ? [categoryFromUrl] : [],
    selectedDatePosted: "",
    salaryRange: [0, 1000],
    sortBy: "latest",
    urgentOnly: false,
  });

  const [availableLocations, setAvailableLocations] = useState<string[]>([]);

  useEffect(() => {
    const newFilters: Partial<FilterState> = {};
    let hasChanges = false;

    if (
      categoryFromUrl &&
      !filters.selectedCategories.includes(categoryFromUrl)
    ) {
      newFilters.selectedCategories = [categoryFromUrl];
      hasChanges = true;
    }

    if (locationFromUrl && filters.location !== locationFromUrl) {
      newFilters.location = locationFromUrl;
      hasChanges = true;
    }

    if (searchFromUrl && filters.searchTerm !== searchFromUrl) {
      newFilters.searchTerm = searchFromUrl;
      hasChanges = true;
    }

    if (hasChanges) {
      setFilters((prev) => ({
        ...prev,
        ...newFilters,
      }));
    }
  }, [categoryFromUrl, locationFromUrl, searchFromUrl]);

  // useEffect(() => {
  //   const loadJobs = async () => {
  //     try {
  //       setIsLoading(true);
  //       const jobsData = await fetchJobsWithUser();
  //       setAllJobs(jobsData);

  //       const locations = jobsData
  //         .map((job) =>
  //           job.studio?.location
  //             ? extractLocationCity(job.studio.location)
  //             : null
  //         )
  //         .filter((location): location is string => !!location)
  //         .reduce((unique: string[], location) => {
  //           if (!unique.includes(location)) {
  //             unique.push(location);
  //           }
  //           return unique;
  //         }, [])
  //         .sort();

  //       setAvailableLocations(locations);
  //     } catch (err) {
  //       console.error("Error loading jobs:", err);
  //       setError("Failed to load jobs. Please try again later.");
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   loadJobs();
  // }, [fetchJobsWithUser]);

  // const filteredAndSortedJobs = useMemo(() => {
  //   let filtered = jobs.filter((job) => {
  //     if (filters.searchTerm) {
  //       const searchTerm = filters.searchTerm.toLowerCase();
  //       const searchableText = [
  //         job.position,
  //         job.description,
  //         ...(job.styles || []),
  //         job?.studio?.name || "",
  //       ]
  //         .join(" ")
  //         .toLowerCase();

  //       if (!searchableText.includes(searchTerm)) {
  //         return false;
  //       }
  //     }

  //     if (filters.location && filters.location !== "all") {
  //       const jobLocation = job.studio?.location
  //         ? extractLocationCity(job.studio.location)
  //         : "";
  //       if (
  //         !jobLocation.toLowerCase().includes(filters.location.toLowerCase())
  //       ) {
  //         return false;
  //       }
  //     }

  //     if (filters.selectedCategories.length > 0) {
  //       const hasMatchingCategory = filters.selectedCategories.some(
  //         (category) =>
  //           job.styles.some(
  //             (style) =>
  //               style.toLowerCase().includes(category.toLowerCase()) ||
  //               category.toLowerCase().includes(style.toLowerCase())
  //           )
  //       );
  //       if (!hasMatchingCategory) return false;
  //     }

  //     if (filters.selectedDatePosted && filters.selectedDatePosted !== "all") {
  //       const jobDate = new Date(job.created_at);
  //       const now = new Date();
  //       const diffTime = Math.abs(now.getTime() - jobDate.getTime());
  //       const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  //       switch (filters.selectedDatePosted) {
  //         case "last-24h":
  //           if (diffDays > 1) return false;
  //           break;
  //         case "last-7d":
  //           if (diffDays > 7) return false;
  //           break;
  //         case "last-30d":
  //           if (diffDays > 30) return false;
  //           break;
  //       }
  //     }

  //     if (filters.urgentOnly) {
  //       const jobDate = new Date(job.created_at);
  //       const now = new Date();
  //       const diffTime = Math.abs(now.getTime() - jobDate.getTime());
  //       const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  //       if (diffDays > 1) return false;
  //     }

  //     const compensation = parseInt(job.compensation.replace(/[^\d]/g, ""));
  //     if (
  //       compensation &&
  //       (compensation < filters.salaryRange[0] ||
  //         compensation > filters.salaryRange[1])
  //     ) {
  //       return false;
  //     }

  //     return true;
  //   });

  //   switch (filters.sortBy) {
  //     case "oldest":
  //       filtered.sort(
  //         (a, b) =>
  //           new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  //       );
  //       break;
  //     case "compensation-high":
  //       filtered.sort((a, b) => {
  //         const aComp = parseInt(a.compensation.replace(/[^\d]/g, "")) || 0;
  //         const bComp = parseInt(b.compensation.replace(/[^\d]/g, "")) || 0;
  //         return bComp - aComp;
  //       });
  //       break;
  //     case "compensation-low":
  //       filtered.sort((a, b) => {
  //         const aComp = parseInt(a.compensation.replace(/[^\d]/g, "")) || 0;
  //         const bComp = parseInt(b.compensation.replace(/[^\d]/g, "")) || 0;
  //         return aComp - bComp;
  //       });
  //       break;
  //     case "latest":
  //     default:
  //       filtered.sort(
  //         (a, b) =>
  //           new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  //       );
  //       break;
  //   }

  //   return filtered;
  // }, [jobs, filters]);

  const totalJobs = jobs.length;
  const totalPages = Math.ceil(totalJobs / jobsPerPage);
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = jobs.slice(
    indexOfFirstJob,
    indexOfLastJob
  );

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, searchTerm: value }));
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      selectedCategories: checked
        ? [...prev.selectedCategories, category]
        : prev.selectedCategories.filter((c) => c !== category),
    }));
  };

  const handleDatePostedChange = (date: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedDatePosted: date === prev.selectedDatePosted ? "" : date,
    }));
  };

  const handleSortChange = (value: string) => {
    setFilters((prev) => ({ ...prev, sortBy: value }));
  };

  const handleSalaryRangeChange = (value: number[]) => {
    setFilters((prev) => ({ ...prev, salaryRange: value }));
  };

  const handleUrgentOnly = (checked: boolean) => {
    setFilters((prev) => ({ ...prev, urgentOnly: checked }));
  };

  const clearAllFilters = () => {
    setFilters({
      searchTerm: "",
      location: "",
      selectedCategories: [],
      selectedDatePosted: "",
      salaryRange: [0, 1000],
      sortBy: "latest",
      urgentOnly: false,
    });
    window.history.replaceState({}, "", "/jobs");
  };

  const hasActiveFilters =
    filters.location ||
    filters.selectedCategories.length > 0 ||
    filters.searchTerm ||
    filters.urgentOnly ||
    filters.selectedDatePosted ||
    filters.salaryRange[0] !== 0 ||
    filters.salaryRange[1] !== 1000;

  return (
    <div className="w-full bg=[#F9FAFC] ">
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-120px)]">
          {/* Main Content - Scrollable */}
          <div className="flex-1 flex flex-col gap-6 overflow-y-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                  Find your next gig
                </h1>
                <p className="text-gray-600 dark:text-gray-400 font-normal">
                  {totalJobs} opportunities
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Select value={filters.sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-auto bg-white dark:bg-[#1a2c35] border-gray-200 dark:border-gray-700">
                    <SortAsc className="w-5 h-5 mr-2" />
                    <span className="hidden sm:inline">Sort</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">Latest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                    <SelectItem value="compensation-high">High Pay</SelectItem>
                    <SelectItem value="compensation-low">Low Pay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filter Dropdowns Bar */}
            <div className="sticky top-0 z-40 -mx-4 px-4 sm:mx-0 sm:px-0 py-3 bg-background-light dark:bg-background-dark/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
              <div className="flex gap-3 overflow-x-auto pb-3">
                {/* Urgent Only Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`group flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg border pl-4 pr-3 transition-all shadow-sm ${
                        filters.urgentOnly
                          ? "bg-green-600 text-white border-green-600"
                          : "bg-white dark:bg-[#1a2c35] border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:border-green-600/50"
                      }`}
                    >
                      <span className="text-sm font-medium whitespace-nowrap">
                        Urgent only
                      </span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuCheckboxItem
                      checked={filters.urgentOnly}
                      onCheckedChange={handleUrgentOnly}
                    >
                      Show only urgent jobs
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Pay Range Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="group flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-[#1a2c35] border border-gray-200 dark:border-gray-700 pl-4 pr-3 hover:border-green-600/50 transition-all shadow-sm text-gray-900 dark:text-white">
                      <span className="text-sm font-medium whitespace-nowrap">
                        Pay Range
                      </span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuLabel>Compensation Range</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="p-4 space-y-4">
                      <Slider
                        value={filters.salaryRange}
                        onValueChange={handleSalaryRangeChange}
                        max={1000}
                        min={0}
                        step={50}
                      />
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>${filters.salaryRange[0]}</span>
                        <span>${filters.salaryRange[1]}</span>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Date & Time Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="group flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-[#1a2c35] border border-gray-200 dark:border-gray-700 pl-4 pr-3 hover:border-green-600/50 transition-all shadow-sm text-gray-900 dark:text-white">
                      <span className="text-sm font-medium whitespace-nowrap">
                        Date & Time
                      </span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuLabel>Posted</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {dateOptions.map((option) => (
                      <DropdownMenuCheckboxItem
                        key={option.value}
                        checked={filters.selectedDatePosted === option.value}
                        onCheckedChange={() =>
                          handleDatePostedChange(option.value)
                        }
                      >
                        {option.label}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Discipline Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="group flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-[#1a2c35] border border-gray-200 dark:border-gray-700 pl-4 pr-3 hover:border-green-600/50 transition-all shadow-sm text-gray-900 dark:text-white">
                      <span className="text-sm font-medium whitespace-nowrap">
                        Discipline
                      </span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-56 max-h-64 overflow-y-auto"
                  >
                    <DropdownMenuLabel>Fitness Style</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {disciplineOptions.map((discipline) => (
                      <DropdownMenuCheckboxItem
                        key={discipline}
                        checked={filters.selectedCategories.includes(
                          discipline
                        )}
                        onCheckedChange={(checked) =>
                          handleCategoryChange(discipline, checked)
                        }
                      >
                        {discipline}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1 self-center shrink-0"></div>

                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/10 px-3 transition-colors"
                  >
                    <span className="text-sm font-medium whitespace-nowrap">
                      Clear all
                    </span>
                  </button>
                )}
              </div>

              {/* Active Filters Display */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {filters.urgentOnly && (
                    <span className="flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-lg text-xs font-medium">
                      Urgent Only
                      <button
                        onClick={() => handleUrgentOnly(false)}
                        className="ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.selectedDatePosted && (
                    <span className="flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-lg text-xs font-medium">
                      {
                        dateOptions.find(
                          (d) => d.value === filters.selectedDatePosted
                        )?.label
                      }
                      <button
                        onClick={() => handleDatePostedChange("")}
                        className="ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.selectedCategories.map((category) => (
                    <span
                      key={category}
                      className="flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-lg text-xs font-medium"
                    >
                      {category}
                      <button
                        onClick={() => handleCategoryChange(category, false)}
                        className="ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {(filters.salaryRange[0] !== 0 ||
                    filters.salaryRange[1] !== 1000) && (
                    <span className="flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-lg text-xs font-medium">
                      ${filters.salaryRange[0]} - ${filters.salaryRange[1]}
                      <button
                        onClick={() => handleSalaryRangeChange([0, 1000])}
                        className="ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Job Listings */}
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-600"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center">{error}</div>
            ) : (
              <>
                <div className="flex flex-col gap-4">
                  {currentJobs.length > 0 ? (
                    currentJobs.map((job) => <JobCard key={job.id} job={job} />)
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500 dark:text-gray-400 text-lg">
                        No jobs found matching your filters.
                      </p>
                      <Button
                        variant="outline"
                        onClick={clearAllFilters}
                        className="mt-4"
                      >
                        Clear all filters
                      </Button>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-8">
                    <Button
                      variant="outline"
                      className="w-10 h-10"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    {pageNumbers.map((number) => {
                      if (
                        number === 1 ||
                        number === totalPages ||
                        (number >= currentPage - 1 && number <= currentPage + 1)
                      ) {
                        return (
                          <Button
                            key={number}
                            variant={
                              currentPage === number ? "default" : "outline"
                            }
                            className={`w-10 h-10 ${
                              currentPage === number
                                ? "bg-green-600 text-white border-green-600"
                                : ""
                            }`}
                            onClick={() => handlePageChange(number)}
                          >
                            {number}
                          </Button>
                        );
                      } else if (
                        number === currentPage - 2 ||
                        number === currentPage + 2
                      ) {
                        return (
                          <span key={number} className="px-2">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                    <Button
                      variant="outline"
                      className="w-10 h-10"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar - Map and Profile Strength - Hidden on mobile, Scrollable */}
          <div className="hidden lg:flex w-80 shrink-0 flex-col gap-6 overflow-y-auto">
            {/* Location Map */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a2c35] overflow-hidden shadow-sm">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-gray-900 dark:text-white">
                  Suggested Location
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {filters.location || "Select a location"}
                </p>
              </div>
              <div className="aspect-square w-full bg-gray-100 bg-cover bg-center relative group cursor-pointer">
                <iframe
                  src={`https://www.google.com/maps/embed?pb=!1m12!1m8!1m3!1d14345.745!2d-118.2437!3d34.0522!3m2!1i1024!2i768!4f13.1!2m1!1s${
                    filters.location || "Los Angeles"
                  }!5e0!3m2!1sen!2sus!4v1234567890`}
                  style={{ border: 0, width: "100%", height: "100%" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
              </div>
            </div>

            {/* Profile Strength */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a2c35] p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                Your Profile Strength
              </h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative size-12 shrink-0">
                  <svg
                    className="size-full -rotate-90"
                    viewBox="0 0 36 36"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      className="stroke-gray-200 dark:stroke-gray-700"
                      cx="18"
                      cy="18"
                      fill="none"
                      r="16"
                      strokeWidth="3"
                    ></circle>
                    <circle
                      className="stroke-green-600"
                      cx="18"
                      cy="18"
                      fill="none"
                      r="16"
                      strokeDasharray="100"
                      strokeDashoffset="15"
                      strokeLinecap="round"
                      strokeWidth="3"
                    ></circle>
                  </svg>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-green-600">
                    85%
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Keep it up!
                  </span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Add more certifications to match with more gigs.
                  </span>
                </div>
              </div>
              <button className="w-full h-8 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-bold hover:bg-gray-50 dark:hover:bg-[#253842] dark:text-white transition-colors">
                Update Profile
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function JobListingLoadingFallback() {
  return (
    <div className="w-full bg-background-light dark:bg-background-dark">
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-600"></div>
        </div>
      </main>
    </div>
  );
}

export default function JobListingPage() {
  return (
    <Suspense fallback={<JobListingLoadingFallback />}>
      <JobListingContent />
    </Suspense>
  );
}
