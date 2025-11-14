// app/explore/page.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar"; // optional
import { Breathing } from "./components";
import { MusicPlayer}  from "./components";
import {Gratitude} from "./components";
import {GroundingCarousel} from "./components";
import {ReadsPanel} from "./components";
import {QuoteCard} from "./components";
import {ChallengeCard} from "./components";
import {SpotifyWidget} from "./components";

export default function ExplorePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-indigo-50 px-6 md:px-16 py-12">
      {/* <Navbar /> */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Explore Wellness 🌿</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Small practices that fit into your day — breathing, grounding, gratitude and calming music.
        </p>
      </motion.div>

      {/* Top grid: Quote + Challenge + Spotify */}
      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2">
          <QuoteCard />
        </div>
        <div>
          <ChallengeCard />
          <div className="mt-6">
            <SpotifyWidget />
          </div>
        </div>
      </div>

      {/* Three column row */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <Breathing />
        <ReadsPanel />
        <Gratitude />
      </div>

      {/* Grounding carousel + music */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <GroundingCarousel />
        <MusicPlayer />
        {/* you can add another card/feature here */}
      </div>

      <footer className="mt-16 text-center text-sm text-gray-500">
        Built with care — small habits compound. © NeuraSense
      </footer>
    </main>
  );
}
