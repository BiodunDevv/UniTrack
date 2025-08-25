import CTA from "../components/Landing/CTA";
import FAQ from "../components/Landing/FAQ";
import Features from "../components/Landing/Features";
import Footer from "../components/Landing/Footer";
import Hero from "../components/Landing/Hero";
import HowItWorks from "../components/Landing/HowItWorks";
import Navbar from "../components/Landing/NavBar";
import Specification from "../components/Landing/Specifications";
import Stats from "../components/Landing/Stats";
import Technologies from "../components/Landing/Technologies";

export default function Home() {
  return (
    <main className="bg-background text-foreground min-h-screen w-full overflow-hidden">
      <Navbar />
      <Hero />
      <Technologies />
      <section id="features">
        <Features />
      </section>
      <Stats />
      <section id="workflow">
        <HowItWorks />
      </section>
      <section id="technology">
        <Specification />
      </section>
      <section id="faq">
        <FAQ />
      </section>
      <section id="cta">
        <CTA />
      </section>
      <Footer />
    </main>
  );
}
