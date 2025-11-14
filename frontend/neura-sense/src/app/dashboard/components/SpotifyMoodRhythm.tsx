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
  played_at: string;
  valence: number;
  energy: number;
};

export default function SpotifyMoodRhythm({ tracks }: { tracks?: SpotifyTrack[] }) {
  const hasData = tracks && tracks.length > 0;

  // ⚡ Improved dynamic mapping (sorted + validated)
  const data = useMemo(() => {
    if (!hasData) return [];

    return [...tracks]
      .sort((a, b) => new Date(a.played_at).getTime() - new Date(b.played_at).getTime())
      .map((t) => ({
        label: new Date(t.played_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        valence: Number(t.valence.toFixed(2)),
        energy: Number(t.energy.toFixed(2)),
        name: t.name,
      }));
  }, [tracks, hasData]);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-indigo-700 font-bold">
          Spotify Mood Rhythm
        </CardTitle>
      </CardHeader>

      <CardContent>
        {/* Empty State */}
        {!hasData && (
          <div className="h-72 flex items-center justify-center text-gray-500 text-sm">
            No Spotify activity found. Connect Spotify to view mood rhythm.
          </div>
        )}

        {/* Mood Graph */}
        {hasData && (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.4} />

                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 1]} tick={{ fontSize: 12 }} />

                <Tooltip
                  formatter={(v, k, p) => [
                    v,
                    k === "valence" ? "Happiness (Valence)" : "Energy Level",
                  ]}
                  labelFormatter={(label, items) =>
                    `${label} — ${items?.[0]?.payload?.name}`
                  }
                  contentStyle={{
                    borderRadius: 12,
                    borderColor: "#6366F1",
                    fontSize: 12,
                  }}
                />

                {/* Happiness Area */}
                <Area
                  type="monotone"
                  dataKey="valence"
                  stroke={SPOTIFY_MOOD_COLORS.happy}
                  strokeWidth={2}
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
        )}

        <p className="text-xs text-gray-500 mt-3 leading-relaxed">
          Your Spotify tracks are analyzed for emotional valence (happiness)
          and energy levels based on audio features.
        </p>
      </CardContent>
    </Card>
  );
}
  