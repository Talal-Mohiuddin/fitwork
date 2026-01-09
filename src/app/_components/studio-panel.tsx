"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Profile } from "@/types";
import { studios } from "@/data";

export default function StudioPanel() {
  // const [studios, setStudios] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   const loadStudios = async () => {
  //     try {
  //       const data = await fetchStudios();
  //       // Get only first 8 studios, sorted by name
  //       const sortedStudios = [...data].slice(0, 8);
  //       setStudios(sortedStudios);
  //     } catch (error) {
  //       console.error("Error loading studios:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   loadStudios();
  // }, [fetchStudios]);

  // Function to get initials from studio name
  const getInitials = (name: string = "Studio"): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <section className="w-full bg-white dark:bg-slate-900 py-20 border-t border-border-light">
      <div className=" max-w-7xl mx-auto px-4 md:px-0">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-light text-neutral-dark dark:text-white mb-2">
            Connect with top studios
          </h2>
          <p className="text-neutral-mid">
            Studios actively hiring in your area.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-teal-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {studios.map((studio) => (
              <div
                key={studio.id}
                className="bg-white border border-border-light rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center text-center group"
              >
                <div className="w-20 h-20 rounded-full bg-slate-100 mb-4 flex items-center justify-center text-xl font-bold text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  {studio.images && studio.images.length > 0 ? (
                    <img
                      src={studio.images[0]}
                      alt={studio.name || "Studio"}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    getInitials(studio.name)
                  )}
                </div>
                <h3 className="font-semibold text-neutral-dark text-lg mb-1">
                  {studio.name || "Unnamed Studio"}
                </h3>
                <p className="text-neutral-mid text-sm mb-4">
                  {studio.location || "Multiple Locations"}
                </p>
                <button className="mt-auto py-1 px-4 rounded-full border border-primary text-primary hover:bg-primary-soft font-semibold text-sm transition-colors w-full">
                  Follow
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Link
            href="/studios"
            className="inline-flex items-center gap-1 font-semibold text-neutral-mid hover:text-neutral-dark"
          >
            View all studios <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
