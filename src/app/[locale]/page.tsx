import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import PainPoints from "@/components/PainPoints";
import Services from "@/components/Services";
import Testimonials from "@/components/Testimonials";
import Portfolio from "@/components/Portfolio";
import Process from "@/components/Process";
import About from "@/components/About";
import Faq from "@/components/Faq";
import SeoAuditTeaser from "@/components/SeoAuditTeaser";
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
        <Testimonials />
        <Portfolio />
        <Process />
        <About />
        <Faq />
        <SeoAuditTeaser />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
