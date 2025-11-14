"use client";

export default function GlobalMentalHealthLoader({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fadeIn">

      {/* Breathing Circle */}
      <div className="relative flex flex-col items-center">
        
        {/* Soft Pulsing Rings */}
        <div className="absolute w-40 h-40 rounded-full bg-indigo-300/20 animate-ping-slow"></div>
        <div className="absolute w-28 h-28 rounded-full bg-indigo-400/25 animate-ping-slower"></div>

        {/* Main Breathing Orb */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-300 animate-breath shadow-xl" />

        {/* Text */}
        <div className="mt-6 text-center text-white font-medium tracking-wide animate-pulse">
          Analyzing your mental well-being…
        </div>

      </div>
    </div>
  );
}
