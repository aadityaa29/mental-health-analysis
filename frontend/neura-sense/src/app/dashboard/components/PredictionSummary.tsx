"use client";

import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CLASS_MAP } from "./constants"; 
import { ArrowUp, ArrowDown } from "lucide-react";

type MlData = {
  condition?: string;
  textInsights: Array<{
    text?: string;
    prediction?: number | string;
    timestamp?: number;
    date?: string;
    probs?: number[];
    probabilities?: Record<string, number>;
  }>;
  mentalHealthVals?: number[];
  probsArray?: number[][];
  lastRun?: string;
};

type Props = {
  mlData: MlData;
};

// If you don't have CLASS_MAP exported elsewhere, you can replace this import by the object below:
// const CLASS_MAP: Record<number, { label: string; color: string }> = {
//   0: { label: "Anxiety", color: "#F59E0B" },
//   1: { label: "Bipolar", color: "#FBBF24" },
//   2: { label: "Depression", color: "#EF4444" },
//   3: { label: "Normal", color: "#10B981" },
//   4: { label: "PTSD", color: "#8B5CF6" },
// };

const periodOptions = ["7d", "30d"] as const;

export default function PredictionSummary({ mlData }: Props) {
  const [period, setPeriod] = useState<typeof periodOptions[number]>("7d");

  // Normalize insights with date
  const insights = useMemo(() => {
    return (
      (mlData?.textInsights || []).map((it, i) => {
        const ts =
          it.timestamp ??
          (it.date ? new Date(it.date).getTime() : undefined) ??
          Date.now();
        const pred = typeof it.prediction === "number"
          ? it.prediction
          : typeof it.prediction === "string" && !isNaN(Number(it.prediction))
            ? Number(it.prediction)
            : (mlData?.mentalHealthVals && mlData.mentalHealthVals[i]) ?? 3;
        return {
          ...it,
          timestamp: ts,
          prediction: pred,
        } as { timestamp: number; prediction: number; text?: string; probs?: number[]; probabilities?: Record<string, number> };
      }) || []
    );
  }, [mlData]);

  // filter by period
  const now = Date.now();
  const cutoff = useMemo(() => {
    if (period === "7d") return now - 1000 * 60 * 60 * 24 * 7;
    return now - 1000 * 60 * 60 * 24 * 30;
  }, [period]);

  const periodInsights = useMemo(() => {
    return insights.filter((i) => (i.timestamp ?? now) >= cutoff);
  }, [insights, cutoff, now]);

  // Count classes
  const countsByClass = useMemo(() => {
    const counts: number[] = [0, 0, 0, 0, 0];
    for (const it of periodInsights) {
      const p = Number(it.prediction ?? 3);
      if (!isNaN(p) && p >= 0 && p < counts.length) counts[p] += 1;
    }
    return counts;
  }, [periodInsights]);

  // Build chart data for bar chart (class label & count)
  const chartData = useMemo(() => {
    return countsByClass.map((c, idx) => ({
      cls: idx,
      label: (CLASS_MAP[idx]?.label ?? String(idx)),
      count: c,
      color: CLASS_MAP[idx]?.color ?? "#9CA3AF",
    }));
  }, [countsByClass]);

  // top class & trend vs previous period (previous 7/30)
  const prevCutoff = useMemo(() => {
    if (period === "7d") return now - 1000 * 60 * 60 * 24 * 14; // prior week start
    return now - 1000 * 60 * 60 * 24 * 60; // prior 30d window
  }, [period, now]);

  const prevPeriodInsights = useMemo(() => {
    return insights.filter((i) => (i.timestamp ?? now) >= prevCutoff && (i.timestamp ?? now) < cutoff);
  }, [insights, prevCutoff, cutoff, now]);

  const prevCounts = useMemo(() => {
    const counts: number[] = [0, 0, 0, 0, 0];
    for (const it of prevPeriodInsights) {
      const p = Number(it.prediction ?? 3);
      if (!isNaN(p) && p >= 0 && p < counts.length) counts[p] += 1;
    }
    return counts;
  }, [prevPeriodInsights]);

  const topClassIdx = useMemo(() => {
    const max = countsByClass.reduce((acc, cur, idx) => (cur > acc.count ? { idx, count: cur } : acc), { idx: 3, count: countsByClass[3] });
    return max.idx;
  }, [countsByClass]);

  const trendDelta = useMemo(() => {
    const cur = countsByClass[topClassIdx] ?? 0;
    const prev = prevCounts[topClassIdx] ?? 0;
    const diff = cur - prev;
    const pct = prev === 0 ? (cur === 0 ? 0 : 100) : Math.round(((cur - prev) / prev) * 100);
    return { diff, pct };
  }, [countsByClass, prevCounts, topClassIdx]);

  // Sparkline: count over days
  const sparkData = useMemo(() => {
    // bucket counts per day for the selected period
    const days = period === "7d" ? 7 : 30;
    const daysArr = Array.from({ length: days }).map((_, i) => {
      const dayStart = new Date(now - (days - 1 - i) * 24 * 60 * 60 * 1000);
      // normalize to midnight
      dayStart.setHours(0, 0, 0, 0);
      return { ts: dayStart.getTime(), label: dayStart.toLocaleDateString(), count: 0 };
    });
    for (const it of periodInsights) {
      const d = new Date(it.timestamp ?? now);
      d.setHours(0, 0, 0, 0);
      const idx = Math.floor((d.getTime() - daysArr[0].ts) / (24 * 60 * 60 * 1000));
      if (idx >= 0 && idx < daysArr.length) daysArr[idx].count += 1;
    }
    return daysArr.map((d) => ({ label: d.label, count: d.count }));
  }, [period, periodInsights, now]);

  // total items in period
  const totalItems = periodInsights.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Predictions Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <div>
                <div className="text-sm text-gray-500">Top Condition</div>
                <div className="text-xl font-semibold" style={{ color: CLASS_MAP[topClassIdx]?.color ?? "#111" }}>
                  {CLASS_MAP[topClassIdx]?.label ?? String(topClassIdx)}
                </div>
              </div>

              <div className="px-3 py-2 rounded bg-gray-50">
                <div className="text-xs text-gray-500">Period</div>
                <div className="flex gap-2 mt-1">
                  {periodOptions.map((p) => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      className={`px-3 py-1 rounded text-sm ${period === p ? "bg-indigo-600 text-white" : "bg-transparent border"}`}
                    >
                      {p === "7d" ? "7 days" : "30 days"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="ml-4">
                <div className="text-xs text-gray-500">Items</div>
                <div className="font-medium">{totalItems}</div>
              </div>

              <div className="ml-4">
                <div className="text-xs text-gray-500">Trend</div>
                <div className="flex items-center gap-2">
                  {trendDelta.diff > 0 ? <ArrowUp className="text-green-600" /> : trendDelta.diff < 0 ? <ArrowDown className="text-red-600" /> : <span className="text-gray-500">—</span>}
                  <div className="text-sm">{trendDelta.pct}%</div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-sm text-gray-600 mb-2">Activity (sparkline)</div>
              <div style={{ width: "100%", height: 48 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparkData}>
                    <Line dataKey="count" stroke="#6366F1" strokeWidth={2} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right side: small bar chart */}
          <div style={{ width: 300, minWidth: 200 }}>
            <div className="text-sm text-gray-600 mb-2">Class distribution</div>
            <div style={{ width: "100%", height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="label" type="category" width={90} />
                  <Tooltip />
                  <Bar dataKey="count" isAnimationActive={false}>
                    {chartData.map((row) => (
                      <Cell key={String(row.cls)} fill={row.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
