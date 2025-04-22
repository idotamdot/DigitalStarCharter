import { useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import MissionSection from "@/components/home/MissionSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import CTASection from "@/components/home/CTASection";

const Home = () => {
  // Scroll to hash on initial load
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a1f]">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <FeaturesSection />
        <MissionSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
