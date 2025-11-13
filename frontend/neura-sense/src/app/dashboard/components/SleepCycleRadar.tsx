//frontend/neura-sense/src/app/dashboard/components/SleepCycleRadar.tsx

"use client";

import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

/**
 * Sleep radar requires a few metrics: sleepHours, bedtimeConsistency (0-1), wakeConsistency (0-1), sleepQuality (0-1)
 */

type SleepMetrics = {
  sleepHours?: number;
  bedtimeConsistency?: number; // 0..1
  wakeConsistency?: number; // 0..1
  sleepQuality?: number; // 0..1
};

type Props = {
  metrics?: SleepMetrics;
};

export default function SleepCycleRadar({ metrics }: Props) {
  const data = useMemo(() => {
    const m = metrics ?? {};
    const sleepHoursNorm = typeof m.sleepHours === "number" ? Math.min(1, m.sleepHours / 8) : 0.75;
    const bedtimeConsistency = m.bedtimeConsistency ?? 0.7;
    const wakeConsistency = m.wakeConsistency ?? 0.65;
    const sleepQuality = m.sleepQuality ?? 0.7;

    return [
      { metric: "Sleep hrs", value: Number(sleepHoursNorm.toFixed(2)) },
      { metric: "Bedtime", value: Number(bedtimeConsistency.toFixed(2)) },
      { metric: "Wake time", value: Number(wakeConsistency.toFixed(2)) },
      { metric: "Quality", value: Number(sleepQuality.toFixed(2)) },
    ];
  }, [metrics]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sleep Cycle Radar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis angle={30} domain={[0, 1]} />
              <Radar name="Sleep profile" dataKey="value" stroke="#6366F1" fill="#6366F1" fillOpacity={0.2} />
              <Tooltip formatter={(v) => `${Math.round(Number(v) * 100)}%`} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="text-xs text-gray-500 mt-3">
          Radar shows normalized sleep metrics — aim for balanced radar across axes.
        </div>
      </CardContent>
    </Card>
  );
}
