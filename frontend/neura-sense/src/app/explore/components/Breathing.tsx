// components/explore/Breathing.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coffee, Play, Pause } from "lucide-react";
import { motion } from "framer-motion";

export default function Breathing() {
  const BREATH_DURATION = 5 * 60;
  const [active, setActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
  return () => {
    if (timerRef.current) clearInterval(timerRef.current);
    window.speechSynthesis.cancel();
  };
}, []);


  useEffect(() => {
    if (!active) return;
    if (seconds >= BREATH_DURATION) {
      stop();
      alert("Nice — you completed a 5-minute reset!");
    }
  }, [seconds, active]);

  function ensureAudio() {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  function softChime() {
    try {
      ensureAudio();
      const ctx = audioCtxRef.current!;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = 880;
      g.gain.value = 0.0001;
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      g.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 1.0);
      setTimeout(() => {
        try { o.stop(); o.disconnect(); } catch {}
      }, 1200);
    } catch {}
  }

  function speak(text: string) {
    try {
      if (!("speechSynthesis" in window)) return;
      const s = new SpeechSynthesisUtterance(text);
      s.rate = 0.95;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(s);
    } catch {}
  }

  function start() {
    if (active) return;
    setActive(true);
    setSeconds(0);
    softChime();
    speak("Starting a 5 minute guided breathing. Inhale, hold, exhale.");
    timerRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
  }

  function stop() {
    setActive(false);
    setSeconds(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    window.speechSynthesis.cancel();
    softChime();
  }

  const cycle = seconds % 14;
  const phase = cycle < 4 ? "Inhale" : cycle < 8 ? "Hold" : "Exhale";
  const phaseProgress = phase === "Inhale" ? cycle / 4 : phase === "Hold" ? (cycle - 4) / 4 : (cycle - 8) / 6;

  const prevPhaseRef = useRef<string | null>(null);
  useEffect(() => {
    if (!active) return;
    if (prevPhaseRef.current !== phase) {
      prevPhaseRef.current = phase;
      speak(phase);
      softChime();
    }
  }, [phase, active]);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coffee className="text-amber-600" /> 5-Min Guided Breathing
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 items-center">
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center">
            <motion.div animate={{ scale: active ? 1.0 + phaseProgress * 0.6 : 1 }} transition={{ duration: 0.6 }} className="w-20 h-20 rounded-full bg-indigo-600/80" />
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-600 mb-1">{active ? `${BREATH_DURATION - seconds}s left` : "Duration: 5 minutes"}</div>
            <div className="text-lg font-semibold mb-2">Phase: <span className="text-indigo-600">{phase}</span></div>
            <div className="flex gap-2">
              <Button onClick={start} disabled={active}><Play /> Start</Button>
              <Button variant="outline" onClick={stop} disabled={!active}><Pause /> Stop</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
