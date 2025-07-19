import About from "@/components/landing/About";
import Contact from "@/components/landing/Contact";
import FAQ from "@/components/landing/FAQ";
import Features from "@/components/landing/Features";
import Footer from "@/components/landing/Footer";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import LoadingScreen from "@/components/landing/LoadingScreen";
import Portfolio from "@/components/landing/Portfolio";
import Testimonials from "@/components/landing/Testimonials";
import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const Landing = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time and ensure minimum display duration
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // 3 seconds loading time

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <LoadingScreen key="loading" />
        ) : (
          <div key="main">
            <Header />
            <Hero />
            <Features />
            <Testimonials />
            <Portfolio />
            <About />
            <FAQ />
            <Contact />
            <Footer />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Landing;
