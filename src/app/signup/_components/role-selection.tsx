import { Building, User } from "lucide-react";
import Link from "next/link";

export const RoleSelection = ({
  onSelect,
}: {
  onSelect: (role: string) => void;
}) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-10 md:py-16 min-h-screen bg-white dark:bg-background-dark">
      {/* Logo */}
      <div className="absolute top-6 left-6 flex items-center gap-2">
        <div className="w-8 h-8 text-[#21c55e]">
          <svg className="w-full h-full" fill="none" viewBox="0 0 48 48">
            <path
              clipRule="evenodd"
              d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z"
              fill="currentColor"
              fillRule="evenodd"
            />
          </svg>
        </div>
        <span className="text-xl font-bold text-[#21c55e]">Fitgig</span>
      </div>

      {/* Login link in top right */}
      <div className="absolute top-6 right-6">
        <Link
          href="/login"
          className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-medium"
        >
          Log In
        </Link>
      </div>

      <div className="w-full max-w-4xl flex flex-col items-center gap-10">
        <div className="text-center max-w-lg mx-auto">
          <h1 className="text-text-main dark:text-white text-3xl md:text-4xl font-bold leading-tight tracking-tight mb-3">
            How will you use Fitgig?
          </h1>
          <p className="text-text-sub dark:text-gray-400 text-lg">
            Select your role to get started with your customized experience.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full lg:px-12">
          <div
            className="group relative flex flex-col overflow-hidden rounded-xl bg-surface-light dark:bg-surface-dark shadow-sm hover:shadow-xl hover:ring-2 hover:ring-primary hover:-translate-y-1 transition-all duration-300 ease-out cursor-pointer h-full border border-gray-100 dark:border-gray-800"
            onClick={() => onSelect("instructor")}
          >
            <div
              className="aspect-[4/3] w-full bg-cover bg-center"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBC3vrh061ra7CdwUxCk7V1PfO_a6ERDknHc-ZN6mmLYefP8s2hlWFXAJ5amKhvKV7_V5Nw50QQlNcRYEeC_g1YsmO8Qz88QiVViipISD88dH-qIoosIqmfv4rExcGtEV6Js04Y54T7Zjp0qGxNZg-ZadmHgo2Hixnu7GoFv1NTTDfr2J-krGMZUjuk-FR44pyrmtcPIaNYhdMSRh9wjtBgX_euj2TzlfQsw7JY2ki30l0Y_5crEkFEyVqckMwE_MFYWTLRTkQzfZ4")',
              }}
            >
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
            </div>
            <div className="flex flex-col flex-1 p-6 md:p-8 justify-between">
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary/20">
                  <User className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-text-main dark:text-white mb-2">
                  I'm an Instructor
                </h3>
                <p className="text-text-sub dark:text-gray-400 leading-relaxed mb-6">
                  Find gigs that fit your schedule. Get paid fast. No commitment
                  required.
                </p>
              </div>
              <button className="w-full rounded-lg bg-[#21c55e] py-3 px-4 text-sm font-bold text-white shadow-sm hover:bg-primary-hover transition-colors flex items-center justify-center gap-2">
                Join as Talent
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          <div
            className="group relative flex flex-col overflow-hidden rounded-xl bg-surface-light dark:bg-surface-dark shadow-sm hover:shadow-xl hover:ring-2 hover:ring-primary hover:-translate-y-1 transition-all duration-300 ease-out cursor-pointer h-full border border-gray-100 dark:border-gray-800"
            onClick={() => onSelect("studio")}
          >
            <div
              className="aspect-[4/3] w-full bg-cover bg-center"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDn6C3OKZiPuMWNb2x5-soOkxf--vfALmr8GFZjVQn2r2m3JWUclvAV4Zoq_c9ZiWHDC7bobzDaQ1sdJvgGzfwplW5VSIvQ2jH28DK8ZYDzo9STkwNaQGlYq2VID_4y8LG9UcyuyZBqbGEspRoNnAqhSSlkXEob4VCqG-An6AkE12I4Rlb79y630Q5ZKufLqmiy_k-l16UGleUfr3Xv9L-BY9Yu1D02k4nH-t6yQjxOgcYv6-1LHJwwxdTDe-XF-LI9FH7TLCHfoY0")',
              }}
            >
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
            </div>
            <div className="flex flex-col flex-1 p-6 md:p-8 justify-between">
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary/20">
                  <Building className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-text-main dark:text-white mb-2">
                  I'm a Studio
                </h3>
                <p className="text-text-sub dark:text-gray-400 leading-relaxed mb-6">
                  Fill gaps in your schedule instantly. Discover top-tier local
                  talent on demand.
                </p>
              </div>
              <button className="w-full rounded-lg bg-[#21c55e] py-3 px-4 text-sm font-bold text-white shadow-sm hover:bg-primary-hover transition-colors flex items-center justify-center gap-2">
                Hire Talent
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Login link at bottom */}
        <div className="text-center mt-4">
          <p className="text-neutral-gray dark:text-slate-400 text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary font-semibold hover:text-primary-hover hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
