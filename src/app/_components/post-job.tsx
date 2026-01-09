"use client";

export default function PostJobSection() {
  return (
    <section className="w-full bg-white dark:bg-slate-900 py-24 border-t border-border-light">
      <div className=" max-w-7xl mx-auto px-4 md:px-0 flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="max-w-xl">
          <h2 className="text-3xl md:text-4xl font-light text-neutral-dark dark:text-white mb-4">
            Post your class needs
          </h2>
          <p className="text-lg text-neutral-mid font-light">
            Create a job post in minutes and reach thousands of qualified
            instructors.
          </p>
        </div>
        <div>
          <button className="px-8 py-4 rounded-full hover:bg-primary-hover text-white text-lg font-semibold transition-all shadow-glow hover:scale-[1.02] bg-[#21C55E]">
            Post a job for free
          </button>
        </div>
      </div>
    </section>
  );
}
