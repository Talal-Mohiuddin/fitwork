"use client";

import Image from "next/image";
import { Mail, CheckCircle } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="w-full pt-12 pb-16 md:py-24  max-w-7xl mx-auto px-4 md:px-0">
      <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
        {/* Left Content */}
        <div className="w-full md:w-1/2 flex flex-col items-start text-left">
          <h1 className="text-5xl lg:text-[56px] font-light text-neutral-dark dark:text-white leading-[1.15] tracking-tight mb-8">
            Find your fitness fit. <br />
            <span className="font-medium text-[#21c55e]">
              Connect with studios, discover gigs.
            </span>
          </h1>
          <div className="w-full max-w-md space-y-4">
            <div className="bg-neutral-light/50 p-1 rounded-lg border border-border-light mb-6 flex items-center gap-2 pl-3">
              <Mail className="w-5 h-5 text-neutral-mid" />
              <input
                className="w-full bg-transparent border-none focus:ring-0 text-neutral-dark text-sm p-2 placeholder:text-neutral-mid/70"
                placeholder="Email or phone"
                type="email"
              />
            </div>
            <div className="flex flex-col gap-3 w-full">
              <button className="w-full h-12 rounded-full bg-[#21c55e] hover:bg-primary-hover text-white text-base font-semibold transition-all shadow-sm flex items-center justify-center">
                Join as an Instructor
              </button>
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-border-light"></div>
                <span className="flex-shrink-0 mx-4 text-neutral-mid text-sm">
                  or
                </span>
                <div className="flex-grow border-t border-border-light"></div>
              </div>
              <button className="w-full h-12 rounded-full bg-white border border-neutral-dark/20 hover:bg-neutral-light text-neutral-dark text-base font-semibold transition-all flex items-center justify-center">
                Join as a Studio
              </button>
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="w-full md:w-1/2 relative h-[400px] md:h-[500px]">
          <div className="absolute inset-0 bg-[#F3F2EF] rounded-[40px] overflow-hidden">
            <Image
              alt="Fitness Activity"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFr98IPbQhDCEDsKdNDqeQtbiLFNma_8A4ELGAJDTOYWy5VJJkB8vRIwN-bbY4i7gwdkV5VjUkw2EBQhbXID8mtFPHI_q4C53qxJVP9YzfxgelazwzyQDIvTRBZDOpPrv--GvRylwGFGYaZn-OxjfOClVi-bQlOBCUrG4V-zfrlq6C4FVdwmUwvjz0MVSMoHyVs2uBWhJ2QURBntDMW_ah1AWCP8_HM7id2ZXQRlTmnBiQz9XeVFroAMgDSTcs4QqUCuwkVbB7iEw"
              className="w-full h-full object-cover mix-blend-overlay opacity-60 grayscale-[20%]"
              fill
            />
            <div className="absolute bottom-0 right-0 w-3/4 h-3/4">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFr98IPbQhDCEDsKdNDqeQtbiLFNma_8A4ELGAJDTOYWy5VJJkB8vRIwN-bbY4i7gwdkV5VjUkw2EBQhbXID8mtFPHI_q4C53qxJVP9YzfxgelazwzyQDIvTRBZDOpPrv--GvRylwGFGYaZn-OxjfOClVi-bQlOBCUrG4V-zfrlq6C4FVdwmUwvjz0MVSMoHyVs2uBWhJ2QURBntDMW_ah1AWCP8_HM7id2ZXQRlTmnBiQz9XeVFroAMgDSTcs4QqUCuwkVbB7iEw"
                alt="Fitness Activity Detail"
                className="w-full h-full object-cover object-center"
                style={{
                  maskImage:
                    "linear-gradient(to top, black 50%, transparent 100%)",
                  WebkitMaskImage:
                    "linear-gradient(to top, black 50%, transparent 100%)",
                }}
                fill
              />
            </div>
          </div>
          <div className="absolute bottom-12 -left-6 bg-white shadow-xl rounded-xl p-4 flex items-center gap-4 max-w-xs animate-[fadeIn_1s_ease-out_forwards]">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <CheckCircle className="w-6 h-6 text-[#21c55e]" />
            </div>
            <div>
              <p className="text-sm font-bold text-neutral-dark">
                Verified Pro
              </p>
              <p className="text-xs text-neutral-mid">
                Pilates Certified • 5yr Exp
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
