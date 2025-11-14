// components/explore/MusicPlayer.tsx
"use client";

import React, { useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music, Play, Pause, Speaker } from "lucide-react";

export default function MusicPlayer() {
  const [playing, setPlaying] = useState(false);
  const [mood, setMood] = useState("calm");
  const audioCtxRef = useRef<AudioContext|null>(null);
  const oscRef = useRef<OscillatorNode|null>(null);
  const gainRef = useRef<GainNode|null>(null);

  function ensureAudio() {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  function startAmbient() {
    if (playing) return;
    ensureAudio();
    const ctx = audioCtxRef.current!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 220;
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = "sine";
    lfo.frequency.value = 0.12;
    lfoGain.gain.value = 8;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    gain.gain.value = 0.0001;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    lfo.start();
    gain.gain.linearRampToValueAtTime(0.035, ctx.currentTime + 1.5);
    oscRef.current = osc;
    gainRef.current = gain;
    setPlaying(true);
  }

  function stopAmbient() {
    try {
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      gainRef.current?.gain.linearRampToValueAtTime(0.00001, ctx.currentTime + 1.0);
      setTimeout(() => {
        try { oscRef.current?.stop(); oscRef.current?.disconnect(); oscRef.current = null; } catch {}
      }, 1100);
    } catch {}
    setPlaying(false);
  }

  function openSpotify() {
    const q = encodeURIComponent(`${mood} relaxing ambient chill`);
    window.open(`https://open.spotify.com/search/${q}`, "_blank");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Music className="text-indigo-600" /> Calming Music</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3 items-center">
          <Button onClick={() => (playing ? stopAmbient() : startAmbient())}>{playing ? <Pause /> : <Play />} {playing ? "Stop" : "Play"}</Button>
          <select value={mood} onChange={(e) => setMood(e.target.value)} className="p-2 rounded border">
            <option value="calm">Calm</option>
            <option value="focus">Focus</option>
            <option value="sleep">Sleep</option>
            <option value="meditative">Meditative</option>
          </select>
          <Button variant="outline" onClick={openSpotify}><Speaker /> Open Spotify</Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">Tip: open Spotify to quickly build a playlist from mood keywords.</p>
      </CardContent>
    </Card>
  );
}
