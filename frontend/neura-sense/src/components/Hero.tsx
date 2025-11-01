"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// ==== ICONS ====
const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 md:w-8 md:h-8 text-white">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const RedditIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 md:w-8 md:h-8 text-white">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-12h2v2h-2v-2zm-3 4c0-1.66 1.34-3 3-3s3 1.34 3 3c0 .83-.34 1.58-.88 2.12-.54.54-1.29.88-2.12.88s-1.58-.34-2.12-.88C9.34 15.58 9 14.83 9 14z" />
  </svg>
);
const SpotifyIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 md:w-8 md:h-8 text-white">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
  </svg>
);

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Parallax transforms
  const yText = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const yVisual = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.5]);

  return (
    <section
      ref={ref}
      className="relative flex flex-col md:flex-row items-center justify-between px-8 md:px-16 py-28 md:py-36 min-h-screen overflow-hidden bg-gradient-to-b from-[#E0F2FE] via-[#fefefe] to-[#FCE7F3]"
    >
      {/* Background Glow */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,_rgba(147,197,253,0.3),_transparent_70%)]"
        style={{ opacity: bgOpacity, y: yVisual }}
      />

      {/* LEFT TEXT */}
      <motion.div
        style={{ y: yText }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9 }}
        className="max-w-2xl space-y-6 text-center md:text-left z-10"
      >
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-gray-900">
          Explore your{" "}
          <span className="text-indigo-600">mental health</span> through AI-powered insights.
        </h1>
        <p className="text-gray-700 text-lg md:text-xl leading-relaxed">
          NeuraSense decodes your <strong>Twitter</strong>, <strong>Reddit</strong>, and{" "}
          <strong>Spotify</strong> activity into meaningful emotional analytics — helping you
          stay balanced, mindful, and in control.
        </p>

        <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-4">
          <Link href="/dashboard">
            <Button size="lg" className="px-8 text-lg bg-indigo-600 hover:bg-indigo-700">
              Get My Insights 🚀
            </Button>
          </Link>
          <Link href="/connect">
            <Button
              variant="outline"
              size="lg"
              className="px-8 text-lg border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50"
            >
              Connect My Accounts
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* RIGHT VISUAL */}
      <motion.div
        style={{ y: yVisual }}
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
        className="relative mt-16 md:mt-0 flex items-center justify-center w-full md:w-1/2 perspective-[1200px]"
      >
        <motion.div
          className="relative w-[320px] h-[320px] md:w-[450px] md:h-[450px] flex items-center justify-center"
          style={{ transformStyle: "preserve-3d" }}
          whileHover={{
            rotateY: 15,
            rotateX: -10,
            scale: 1.05,
            transition: { type: "spring", stiffness: 80 },
          }}
        >
          {/* Glowing Core */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full blur-3xl opacity-30" />
          <div className="absolute inset-8 bg-white/30 rounded-full backdrop-blur-xl flex items-center justify-center shadow-2xl border border-white/40">
            <span className="text-lg md:text-xl font-semibold text-gray-800">
              NeuraSense
            </span>
          </div>

          {/* Floating Orbs */}
          <motion.div
            className="absolute w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center shadow-xl"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{ top: "8%", left: "15%", transform: "translateZ(50px)" }}
          >
            <TwitterIcon />
          </motion.div>
          <motion.div
            className="absolute w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center shadow-xl"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            style={{ bottom: "12%", right: "15%", transform: "translateZ(40px)" }}
          >
            <RedditIcon />
          </motion.div>
          <motion.div
            className="absolute w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-xl"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4.5, repeat: Infinity }}
            style={{ bottom: "8%", left: "20%", transform: "translateZ(60px)" }}
          >
            <SpotifyIcon />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
