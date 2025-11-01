"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function AccuracySection() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = ((e.clientX - window.innerWidth / 2) / window.innerWidth) * 20;
      const y = ((e.clientY - window.innerHeight / 2) / window.innerHeight) * 20;
      setTilt({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const stats = [
    { label: "Model Accuracy", value: 92, color: "bg-primary/30" },
    { label: "User Privacy", value: 100, color: "bg-green-400/40" },
    { label: "Emotional Detection Precision", value: 90, color: "bg-indigo-300/40" },
  ];

  return (
    <section
      id="accuracy"
      className="relative py-24 px-6 md:px-16 bg-gradient-to-b from-[#e9f8ff] via-white to-[#f3f7ff] overflow-hidden"
    >
      {/* Glowing background orbs */}
      <div className="absolute -top-32 left-1/3 w-96 h-96 bg-blue-200 opacity-30 blur-3xl rounded-full animate-pulse" />
      <div className="absolute top-1/2 -right-40 w-80 h-80 bg-purple-200 opacity-30 blur-3xl rounded-full animate-pulse delay-1000" />

      <div className="max-w-6xl mx-auto text-center relative z-10 space-y-12">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl font-extrabold text-gray-900 tracking-tight"
        >
          Our <span className="text-primary">AI Mental Health</span> Accuracy
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed"
        >
          Trained on thousands of anonymized social interactions, our AI analyzes emotion,
          tone, and behavior with precision — helping you stay mindful and emotionally aware.
        </motion.p>

        <div className="flex flex-col md:flex-row justify-center items-center gap-12 mt-14">
          {stats.map((item, i) => (
            <motion.div
              key={i}
              style={{
                rotateX: tilt.y,
                rotateY: tilt.x,
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.2, type: "spring", stiffness: 70 }}
              className="relative bg-white/80 backdrop-blur-md border border-white/40 shadow-2xl p-8 rounded-2xl w-[300px] hover:shadow-primary/30 hover:scale-[1.03] transition-transform duration-300"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/40 to-blue-300/30 opacity-0 hover:opacity-100 transition-opacity duration-500" />

              <h3 className="text-lg font-semibold mb-4 text-gray-900 relative z-10">
                {item.label}
              </h3>

              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${item.value}%` }}
                transition={{ duration: 1.2, delay: 0.4 }}
                className={`h-3 rounded-full ${item.color} relative z-10`}
              />
              <p className="text-sm text-gray-600 mt-3 relative z-10">
                {item.value}% validated on global test data
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
