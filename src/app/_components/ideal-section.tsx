"use client";

import Image from "next/image";
import { CheckCircle, Zap } from "lucide-react";
import Link from "next/link";

export default function IdealSection() {
  return (
    <section className="w-full bg-[#F3F2EF] dark:bg-slate-900 py-24">
      <div className=" max-w-7xl mx-auto px-4 md:px-0 flex flex-col md:flex-row items-center gap-16">
        {/* Left Content */}
        <div className="w-full md:w-1/2 order-2 md:order-1">
          <div className="relative rounded-full overflow-hidden aspect-square max-w-[400px] mx-auto border-8 border-white/50 shadow-2xl">
            <Image
              alt="Yoga Instructor"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCsYuCR33wHEQ8Pnsy7K6Dh2KDTa2mYzzp8AoRllx6ozHH2C9tPRW8XFn2KJJQ6PP4HR6cJPiL-z3LEPhtBtUann_vILX-6LgfT7HJIgN6wAZIQHdvbTCG5pjzViIx7b9-TIz5s_1yJJ012FkleoG16xJ5HdhUyakte6YQTj8bubr6GS0r-mdpXfQgqs00IHamNQ6P1dE0DVxzj_T6KIQL7QbqF9Hllnn2lzLEX3IFPQ3rF992wdvzTsn4geNQe-AW3sVREiM2oGnQ"
              className="w-full h-full object-cover"
              width={400}
              height={400}
            />
            <div className="absolute bottom-10 right-10 bg-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
              <div className="w-2 h-2 bg-[#21C55E] rounded-full"></div>
              <span className="text-sm font-bold text-neutral-dark">
                Available Now
              </span>
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="w-full md:w-1/2 order-1 md:order-2">
          <h2 className="text-3xl md:text-5xl font-light text-neutral-dark dark:text-white mb-6 leading-tight">
            Find your ideal <br />
            <span className="text-[#21C55E] font-medium">
              instructor talent.
            </span>
          </h2>
          <p className="text-lg text-neutral-mid mb-8 font-light">
            For studios: access a pre-vetted network of professionals. View
            certifications, ratings, and real-time availability.
          </p>
          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 text-[#21C55E] shadow-sm">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-medium text-neutral-dark">
                  Verified Credentials
                </h4>
                <p className="text-neutral-mid text-sm">
                  Every instructor is background checked and certified.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 text-[#21C55E] shadow-sm">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-medium text-neutral-dark">
                  Instant Booking
                </h4>
                <p className="text-neutral-mid text-sm">
                  Fill slots in minutes, not days. Automated payments included.
                </p>
              </div>
            </div>
          </div>
          <button className="mt-10 px-8 py-3 rounded-full border-2 border-neutral-dark text-neutral-dark font-semibold hover:bg-neutral-light transition-all">
            <Link href={'instructors'}>
              Find Talent
            </Link>

          </button>
        </div>
      </div>
    </section>
  );
}
