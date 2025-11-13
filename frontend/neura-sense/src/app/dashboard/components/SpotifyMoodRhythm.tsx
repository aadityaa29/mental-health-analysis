//frontend/neura-sense/src/app/dashboard/components/SpotifyMoodRhythm.tsx

"use client";

import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SPOTIFY_MOOD_COLORS } from "./constants";

type SpotifyTrack = {
  name: string;
  played_at: string; // ISO
  valence: number;   // 0–1
  energy: number;    // 0–1
};

// Props will accept data directly from dashboard (backend-fetch soon)
export default function SpotifyMoodRhythm({
  tracks,
}: {
  tracks?: SpotifyTrack[];
}) {
  // fallback mock data if no spotify data yet
  const data = useMemo(() => {
    const src = tracks && tracks.length > 0 ? tracks : fallbackSpotifyData();

    return src.map((t) => ({
      label: new Date(t.played_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      valence: Number(t.valence.toFixed(2)),
      energy: Number(t.energy.toFixed(2)),
      name: t.name,
    }));
  }, [tracks]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spotify Mood Rhythm</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis domain={[0, 1]} />
              <Tooltip
                formatter={(v, k, p) => [
                  v,
                  k === "valence"
                    ? "Happiness (Valence)"
                    : "Energy Level",
                ]}
                labelFormatter={(label, items) =>
                  `${label} — ${items?.[0]?.payload?.name}`
                }
              />

              {/* Mood Zone Area */}
              <Area
                type="monotone"
                dataKey="valence"
                stroke={SPOTIFY_MOOD_COLORS.happy}
                fill={SPOTIFY_MOOD_COLORS.happy + "33"}
                name="Valence (Happiness)"
              />

              {/* Energy Line */}
              <Line
                type="monotone"
                dataKey="energy"
                stroke={SPOTIFY_MOOD_COLORS.energetic}
                strokeWidth={3}
                dot={false}
                name="Energy"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="text-xs text-gray-500 mt-3">
          Tracks are color-visualized based on mood & energy extracted from
          Spotify audio features.
        </div>
      </CardContent>
    </Card>
  );
}

/* ---------------------------
   Fallback Spotify data
----------------------------*/
function fallbackSpotifyData(): SpotifyTrack[] {
  const now = Date.now();

  return [
    {
      name: "Dreaming Awake",
      played_at: new Date(now - 1000 * 60 * 60).toISOString(),
      valence: 0.75,
      energy: 0.65,
    },
    {
      name: "Lost in Echoes",
      played_at: new Date(now - 1000 * 60 * 45).toISOString(),
      valence: 0.40,
      energy: 0.50,
    },
    {
      name: "Silent Waves",
      played_at: new Date(now - 1000 * 60 * 30).toISOString(),
      valence: 0.30,
      energy: 0.30,
    },
    {
      name: "Rise Again",
      played_at: new Date(now - 1000 * 60 * 15).toISOString(),
      valence: 0.85,
      energy: 0.80,
    },
  ];
}
