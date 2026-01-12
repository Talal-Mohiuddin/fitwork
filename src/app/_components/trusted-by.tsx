"use client";

import Link from "next/link";

export default function TrustedBySection() {
  return (
    <>
      {/* Trusted By Section */}
      <section className="w-full bg-[#F3F2EF] dark:bg-slate-800/50 py-10 border-y border-border-light dark:border-slate-800">
        <div className=" max-w-7xl mx-auto px-4 md:px-0">
          <p className="text-sm text-center text-neutral-mid mb-6 font-medium">
            TRUSTED BY INDUSTRY LEADERS
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <span className="text-xl font-display font-bold text-slate-800 dark:text-slate-200 tracking-tight">
              CorePower
            </span>
            <span className="text-xl font-display font-black text-slate-800 dark:text-slate-200 tracking-tighter italic">
              SOULCYCLE
            </span>
            <span className="text-xl font-display font-bold text-slate-800 dark:text-slate-200">
              Barry's
            </span>
            <span className="text-xl font-display font-light text-slate-800 dark:text-slate-200 tracking-[0.2em] uppercase">
              Equinox
            </span>
            <span className="text-xl font-display font-bold text-slate-800 dark:text-slate-200 tracking-wide">
              Solidcore
            </span>
          </div>
        </div>
      </section>

      {/* Discover Fitness Gigs Section */}
      <section className="w-full bg-[#F3F2EF] dark:bg-slate-900 py-16 md:py-20">
        <div className=" max-w-7xl mx-auto px-4 md:px-0 flex flex-col md:flex-row gap-12">
          <div className="w-full md:w-1/3">
            <h2 className="text-3xl md:text-4xl font-light text-neutral-dark dark:text-white mb-6">
              Discover <br />
              Fitness Gigs
            </h2>
            <p className="text-neutral-mid mb-8 text-lg font-light">
              Explore opportunities tailored to your expertise.
            </p>
          </div>
          <div className="w-full md:w-2/3">
            <div className="flex flex-wrap gap-3">
              <Link href="/instructors?styles=Pilates" className="px-6 py-3 rounded-full border-2 border-black text-neutral-dark hover:bg-neutral-light bg-transparent font-medium transition-colors text-sm md:text-base">
                Pilates Instructor
              </Link>
              <Link href="/instructors?styles=Yoga" className="px-6 py-3 rounded-full border-2 border-black text-neutral-dark hover:bg-neutral-light bg-transparent font-medium transition-colors text-sm md:text-base">
                Yoga Teacher
              </Link>
              <Link href="/instructors?styles=Spinning" className="px-6 py-3 rounded-full border-2 border-black text-neutral-dark hover:bg-neutral-light bg-transparent font-medium transition-colors text-sm md:text-base">
                Cycle Instructor
              </Link>
              <Link href="/instructors?certifications=Personal%20Trainer" className="px-6 py-3 rounded-full border-2 border-black text-neutral-dark hover:bg-neutral-light bg-transparent font-medium transition-colors text-sm md:text-base">
                Personal Trainer
              </Link>
              <Link href="/instructors?certifications=Group%20Fitness%20Instructor" className="px-6 py-3 rounded-full border-2 border-black text-neutral-dark hover:bg-neutral-light bg-transparent font-medium transition-colors text-sm md:text-base">
                Group Fitness
              </Link>
              <Link href="/instructors?styles=Barre" className="px-6 py-3 rounded-full border-2 border-black text-neutral-dark hover:bg-neutral-light bg-transparent font-medium transition-colors text-sm md:text-base">
                Barre
              </Link>
              <Link href="/instructors?styles=HIIT" className="px-6 py-3 rounded-full border-2 border-black text-neutral-dark hover:bg-neutral-light bg-transparent font-medium transition-colors text-sm md:text-base">
                HIIT Coach
              </Link>
              <Link href="/instructors" className="px-6 py-3 rounded-full bg-neutral-ligh  font-bold hover:bg-white hover:border-primary transition-colors text-sm md:text-base text-[#21c55e] bg-[#f9fafc]">
                Show all categories
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
