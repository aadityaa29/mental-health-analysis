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

type SleepMetrics = {
  sleepHours?: number;
  bedtimeConsistency?: number;
  wakeConsistency?: number;
  sleepQuality?: number;
};

type Props = {
  metrics?: SleepMetrics;
};

export default function SleepCycleRadar({ metrics }: Props) {
  const data = useMemo(() => {
    const m = metrics ?? {};
    const sleepHoursNorm =
      typeof m.sleepHours === "number" ? Math.min(1, m.sleepHours / 8) : 0.75;

    return [
      { metric: "Sleep Hours", value: Number(sleepHoursNorm.toFixed(2)) },
      { metric: "Bedtime Consistency", value: Number((m.bedtimeConsistency ?? 0.7).toFixed(2)) },
      { metric: "Wake Consistency", value: Number((m.wakeConsistency ?? 0.65).toFixed(2)) },
      { metric: "Sleep Quality", value: Number((m.sleepQuality ?? 0.7).toFixed(2)) },
    ];
  }, [metrics]);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-indigo-700 font-bold">
          Sleep Cycle Radar
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
              <PolarGrid stroke="#E5E7EB" strokeOpacity={0.6} />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fill: "#374151", fontSize: 12, fontWeight: 500 }}
              />
              <PolarRadiusAxis
                tick={false}
                axisLine={false}
                domain={[0, 1]}
              />

              {/* Radar Shape */}
              <Radar
                name="Sleep Profile"
                dataKey="value"
                stroke="#6366F1"
                fill="#6366F1"
                fillOpacity={0.25}
                strokeWidth={2}
              />

              {/* Tooltip */}
              <Tooltip
                contentStyle={{
                  borderRadius: "10px",
                  borderColor: "#6366F1",
                  fontSize: "12px",
                }}
                formatter={(v: number) => `${Math.round(v * 100)}%`}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <p className="text-xs text-gray-500 mt-3 leading-relaxed">
          Balanced sleep patterns help improve mood, energy, and emotional
          stability. Aim for a smooth, even radar shape across all sleep
          metrics.
        </p>
      </CardContent>
    </Card>
  );
}
