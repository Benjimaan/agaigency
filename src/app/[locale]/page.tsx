import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import PainPoints from "@/components/PainPoints";
import Services from "@/components/Services";
import PremiumExpertise from "@/components/PremiumExpertise";
import Testimonials from "@/components/Testimonials";
import Portfolio from "@/components/Portfolio";
import PremiumProcess from "@/components/PremiumProcess";
import About from "@/components/About";
import Faq from "@/components/Faq";
import CtaBandeau from "@/components/CtaBandeau";
import SeoAuditTeaser from "@/components/SeoAuditTeaser";
import GoogleAdsTeaser from "@/components/GoogleAdsTeaser";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <PainPoints />
        <Services />
        <PremiumExpertise />
        <Testimonials />
        <Portfolio />
        <CtaBandeau />
        <PremiumProcess />
        <About />
        <Faq />
        <SeoAuditTeaser />
        <GoogleAdsTeaser />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
