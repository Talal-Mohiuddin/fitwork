"use client";

import { useState } from "react";
import { ChevronDown, X, Search } from "lucide-react";
import { fitnessStyles } from "@/constants";
import { studios } from "@/data";

interface FilterSidebarProps {
  onFilterChange: (filters: any) => void;
}

export default function FilterSidebar({ onFilterChange }: FilterSidebarProps) {
  const [filters, setFilters] = useState({
    search: "",
    location: [] as string[],
    styles: [] as string[],
    amenities: [] as string[],
    minRating: 0,
    sortBy: "recommended",
  });

  const [expandedSections, setExpandedSections] = useState({
    search: true,
    location: true,
    styles: true,
    amenities: true,
    rating: true,
  });

  // Extract unique locations and amenities from studios
  const uniqueLocations = Array.from(
    new Set(studios.map((s) => s.location).filter(Boolean))
  ) as string[];

  const uniqueAmenities = Array.from(
    new Set(studios.flatMap((s) => s.amenities || []))
  ) as string[];

  const ratingOptions = [
    { label: "All", value: 0 },
    { label: "3★+", value: 3 },
    { label: "3.5★+", value: 3.5 },
    { label: "4★+", value: 4 },
    { label: "4.5★+", value: 4.5 },
  ];

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSearch = (value: string) => {
    const newFilters = { ...filters, search: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleLocationToggle = (location: string) => {
    const newLocations = filters.location.includes(location)
      ? filters.location.filter((l) => l !== location)
      : [...filters.location, location];

    const newFilters = { ...filters, location: newLocations };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleStyleToggle = (style: string) => {
    const newStyles = filters.styles.includes(style)
      ? filters.styles.filter((s) => s !== style)
      : [...filters.styles, style];

    const newFilters = { ...filters, styles: newStyles };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleAmenityToggle = (amenity: string) => {
    const newAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter((a) => a !== amenity)
      : [...filters.amenities, amenity];

    const newFilters = { ...filters, amenities: newAmenities };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleRatingChange = (rating: number) => {
    const newFilters = { ...filters, minRating: rating };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    const defaultFilters = {
      search: "",
      location: [] as string[],
      styles: [] as string[],
      amenities: [] as string[],
      minRating: 0,
      sortBy: "recommended",
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const activeFilterCount =
    filters.location.length +
    filters.styles.length +
    filters.amenities.length +
    (filters.minRating > 0 ? 1 : 0);

  return (
    <aside className="hidden lg:flex w-64 bg-surface-light dark:bg-surface-dark border-r border-border-light dark:border-border-dark overflow-y-auto flex-col">
      <div className="sticky top-0 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark p-6 z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text-main dark:text-white">
            Filters
          </h2>
          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="text-xs font-bold text-primary hover:text-primary-hover transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 px-6 py-4 space-y-6 overflow-y-auto">
        {/* Search */}
        <div>
          <button
            onClick={() => toggleSection("search")}
            className="w-full flex items-center justify-between mb-3 hover:text-primary transition-colors"
          >
            <span className="font-bold text-text-main dark:text-white">
              Search
            </span>
            <ChevronDown
              size={18}
              className={`transition-transform ${
                expandedSections.search ? "rotate-180" : ""
              }`}
            />
          </button>
          {expandedSections.search && (
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <input
                type="text"
                placeholder="Studio name..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-text-main dark:text-white placeholder-text-muted focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          )}
        </div>

        {/* Location */}
        <div>
          <button
            onClick={() => toggleSection("location")}
            className="w-full flex items-center justify-between mb-3 hover:text-primary transition-colors"
          >
            <span className="font-bold text-text-main dark:text-white">
              Location
            </span>
            <ChevronDown
              size={18}
              className={`transition-transform ${
                expandedSections.location ? "rotate-180" : ""
              }`}
            />
          </button>
          {expandedSections.location && (
            <div className="space-y-2">
              {uniqueLocations.map((location) => (
                <label
                  key={location}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={filters.location.includes(location)}
                    onChange={() => handleLocationToggle(location)}
                    className="w-4 h-4 rounded border-border-light dark:border-border-dark accent-primary"
                  />
                  <span className="text-sm text-text-muted group-hover:text-text-main dark:group-hover:text-white transition-colors">
                    {location}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Fitness Styles */}
        <div>
          <button
            onClick={() => toggleSection("styles")}
            className="w-full flex items-center justify-between mb-3 hover:text-primary transition-colors"
          >
            <span className="font-bold text-text-main dark:text-white">
              Fitness Styles
            </span>
            <ChevronDown
              size={18}
              className={`transition-transform ${
                expandedSections.styles ? "rotate-180" : ""
              }`}
            />
          </button>
          {expandedSections.styles && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {fitnessStyles.slice(0, 15).map((style) => (
                <label
                  key={style}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={filters.styles.includes(style)}
                    onChange={() => handleStyleToggle(style)}
                    className="w-4 h-4 rounded border-border-light dark:border-border-dark accent-primary"
                  />
                  <span className="text-sm text-text-muted group-hover:text-text-main dark:group-hover:text-white transition-colors">
                    {style}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Amenities */}
        <div>
          <button
            onClick={() => toggleSection("amenities")}
            className="w-full flex items-center justify-between mb-3 hover:text-primary transition-colors"
          >
            <span className="font-bold text-text-main dark:text-white">
              Amenities
            </span>
            <ChevronDown
              size={18}
              className={`transition-transform ${
                expandedSections.amenities ? "rotate-180" : ""
              }`}
            />
          </button>
          {expandedSections.amenities && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {uniqueAmenities.map((amenity) => (
                <label
                  key={amenity}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={filters.amenities.includes(amenity)}
                    onChange={() => handleAmenityToggle(amenity)}
                    className="w-4 h-4 rounded border-border-light dark:border-border-dark accent-primary"
                  />
                  <span className="text-sm text-text-muted group-hover:text-text-main dark:group-hover:text-white transition-colors">
                    {amenity}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Rating */}
        <div>
          <button
            onClick={() => toggleSection("rating")}
            className="w-full flex items-center justify-between mb-3 hover:text-primary transition-colors"
          >
            <span className="font-bold text-text-main dark:text-white">
              Minimum Rating
            </span>
            <ChevronDown
              size={18}
              className={`transition-transform ${
                expandedSections.rating ? "rotate-180" : ""
              }`}
            />
          </button>
          {expandedSections.rating && (
            <div className="space-y-2">
              {ratingOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="rating"
                    checked={filters.minRating === option.value}
                    onChange={() => handleRatingChange(option.value)}
                    className="w-4 h-4 border-border-light dark:border-border-dark accent-primary"
                  />
                  <span className="text-sm text-text-muted group-hover:text-text-main dark:group-hover:text-white transition-colors">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
