// components/explore/SpotifyWidget.tsx
"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Speaker } from "lucide-react";

export default function SpotifyWidget() {
  const [mood, setMood] = useState("calm");
  function openSpotify() {
    const q = encodeURIComponent(`${mood} relaxing ambient chill`);
    window.open(`https://open.spotify.com/search/${q}`, "_blank");
  }
  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Speaker /> Spotify Relax</CardTitle></CardHeader>
      <CardContent>
        <div className="flex gap-2 items-center">
          <select value={mood} onChange={(e)=>setMood(e.target.value)} className="p-2 rounded border">
            <option value="calm">Calm</option>
            <option value="meditative">Meditative</option>
            <option value="sleep">Sleep</option>
            <option value="focus">Focus</option>
          </select>
          <Button variant="outline" onClick={openSpotify}>Open Spotify</Button>
        </div>
        <div className="text-xs text-gray-500 mt-2">Opens Spotify search — for a richer experience integrate Spotify API + OAuth.</div>
      </CardContent>
    </Card>
  );
}
