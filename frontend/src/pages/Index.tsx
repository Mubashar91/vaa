import { Navbar } from "@/components/Navbar";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Hero } from "@/components/Hero";
import { ValueProposition } from "@/components/ValueProposition";
import { HowItWorksDynamic } from "@/components/HowItWorksDynamic";
import { Services } from "@/components/Services";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { PricingDynamic } from "@/components/PricingDynamic";
import { ToolsIntegration } from "@/components/ToolsIntegration";
import { Testimonials } from "@/components/Testimonials";
import { FAQ } from "@/components/FAQ";
import { CaseStudies } from "@/components/CaseStudies";
import { Blog } from "@/components/Blog";

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      // Defer to ensure sections are mounted
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 0);
    }
  }, [location]);

  return (
    <main className="min-h-screen overflow-x-hidden">
      {/* Main content with horizontal padding only on desktop */}
      <div className="px-0 md:px-[70px]">
        <Navbar />
        <Hero />
        <ValueProposition />
        <HowItWorksDynamic />
        <Services />
        <WhyChooseUs />
        <PricingDynamic />
        <ToolsIntegration />
        <Testimonials />
        <Blog />
        <CaseStudies />
        <FAQ />
      </div>

    </main>
  );
};

export default Index;