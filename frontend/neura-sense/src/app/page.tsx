"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import AccuracySection from "@/components/AccuracySection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <AccuracySection />
      <Footer />
    </main>
  );
}
