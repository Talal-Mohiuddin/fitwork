import Image from "next/image";
import HeroSection from "./_components/hero-section";
import TrustedBySection from "./_components/trusted-by";
import StudioPanel from "./_components/studio-panel";
import IdealSection from "./_components/ideal-section";
import PostJobSection from "./_components/post-job";

export default function Home() {
  return (
    <>
      <HeroSection />
      <TrustedBySection />
      <StudioPanel />
      <IdealSection />
      <PostJobSection />
    </>
  );
}
