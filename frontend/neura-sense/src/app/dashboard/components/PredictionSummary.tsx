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

const periodOptions = ["7d", "30d"] as const;

export default function PredictionSummary({ mlData }: Props) {
  const [period, setPeriod] =
    useState<typeof periodOptions[number]>("7d");

  /* -----------------------------
      NORMALIZE TEXT INSIGHTS
  ----------------------------- */
  const insights = useMemo(() => {
    return (
      mlData?.textInsights?.map((it, i) => {
        const ts =
          it.timestamp ??
          (it.date ? new Date(it.date).getTime() : undefined) ??
          Date.now();

        const pred =
          typeof it.prediction === "number"
            ? it.prediction
            : typeof it.prediction === "string" &&
              !isNaN(Number(it.prediction))
            ? Number(it.prediction)
            : mlData?.mentalHealthVals?.[i] ?? 3;

        return {
          ...it,
          timestamp: ts,
          prediction: pred,
        };
      }) ?? []
    );
  }, [mlData]);

  /* -----------------------------
      PERIOD FILTER
  ----------------------------- */
  const now = Date.now();
  const cutoff = useMemo(
    () =>
      period === "7d"
        ? now - 7 * 24 * 60 * 60 * 1000
        : now - 30 * 24 * 60 * 60 * 1000,
    [period]
  );

  const periodInsights = useMemo(
    () => insights.filter((i) => (i.timestamp ?? now) >= cutoff),
    [insights, cutoff, now]
  );

  /* -----------------------------
      CLASS COUNTS
  ----------------------------- */
  const countsByClass = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    periodInsights.forEach((it) => {
      const p = Number(it.prediction ?? 3);
      if (!isNaN(p) && p >= 0 && p <= 4) counts[p] += 1;
    });
    return counts;
  }, [periodInsights]);

  /* -----------------------------
      BAR CHART DATA
  ----------------------------- */
  const chartData = useMemo(
    () =>
      countsByClass.map((count, idx) => ({
        cls: idx,
        label: CLASS_MAP[idx]?.label ?? String(idx),
        count,
        color: CLASS_MAP[idx]?.color ?? "#999",
      })),
    [countsByClass]
  );

  /* -----------------------------
      TREND VS PREVIOUS PERIOD
  ----------------------------- */
  const prevCutoff = useMemo(
    () =>
      period === "7d"
        ? now - 14 * 24 * 60 * 60 * 1000
        : now - 60 * 24 * 60 * 60 * 1000,
    [period, now]
  );

  const prevPeriodInsights = useMemo(
    () =>
      insights.filter(
        (i) =>
          (i.timestamp ?? now) >= prevCutoff &&
          (i.timestamp ?? now) < cutoff
      ),
    [insights, prevCutoff, cutoff, now]
  );

  const prevCounts = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    prevPeriodInsights.forEach((it) => {
      const p = Number(it.prediction ?? 3);
      if (!isNaN(p) && p >= 0 && p <= 4) counts[p] += 1;
    });
    return counts;
  }, [prevPeriodInsights]);

  const topClassIdx = useMemo(() => {
    let maxIdx = 3;
    let maxCount = countsByClass[3];
    countsByClass.forEach((c, i) => {
      if (c > maxCount) {
        maxCount = c;
        maxIdx = i;
      }
    });
    return maxIdx;
  }, [countsByClass]);

  const trendDelta = useMemo(() => {
    const cur = countsByClass[topClassIdx] ?? 0;
    const prev = prevCounts[topClassIdx] ?? 0;
    const pct =
      prev === 0 ? (cur === 0 ? 0 : 100) : Math.round(((cur - prev) / prev) * 100);
    return { diff: cur - prev, pct };
  }, [countsByClass, prevCounts, topClassIdx]);

  /* -----------------------------
      SPARKLINE DATA
  ----------------------------- */
  const sparkData = useMemo(() => {
    const days = period === "7d" ? 7 : 30;

    const daysArr = Array.from({ length: days }, (_, i) => {
      const d = new Date(now - (days - 1 - i) * 86400000);
      d.setHours(0, 0, 0, 0);
      return { ts: d.getTime(), label: d.toLocaleDateString(), count: 0 };
    });

    periodInsights.forEach((it) => {
      const d = new Date(it.timestamp ?? now);
      d.setHours(0, 0, 0, 0);
      const index = Math.floor(
        (d.getTime() - daysArr[0].ts) / 86400000
      );
      if (index >= 0 && index < daysArr.length) daysArr[index].count += 1;
    });

    return daysArr;
  }, [period, periodInsights, now]);

  /* -----------------------------
      RENDER
  ----------------------------- */
  const totalItems = periodInsights.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold text-indigo-700">
          AI Predictions Summary
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ---------------- LEFT SIDE ---------------- */}
          <div className="flex-1">
            {/* TOP CONDITION + PERIOD SELECTOR */}
            <div className="flex flex-wrap items-center gap-6 mb-6">

              {/* TOP CONDITION */}
              <div>
                <div className="text-sm text-gray-500">Top Condition</div>
                <div
                  className="text-xl font-semibold"
                  style={{
                    color: CLASS_MAP[topClassIdx]?.color ?? "#111",
                  }}
                >
                  {CLASS_MAP[topClassIdx]?.label ?? topClassIdx}
                </div>
              </div>

              {/* PERIOD SELECTOR */}
              <div className="px-3 py-2 rounded bg-gray-50 border">
                <div className="text-xs text-gray-500">Period</div>
                <div className="flex gap-2 mt-1">
                  {periodOptions.map((p) => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      className={`px-3 py-1 rounded text-sm border transition ${
                        period === p
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white text-gray-700 border-gray-300"
                      }`}
                    >
                      {p === "7d" ? "Last 7 days" : "Last 30 days"}
                    </button>
                  ))}
                </div>
              </div>

              {/* TOTAL ITEMS */}
              <div>
                <div className="text-xs text-gray-500">Items</div>
                <div className="font-medium">{totalItems}</div>
              </div>

              {/* TREND */}
              <div>
                <div className="text-xs text-gray-500">Trend</div>
                <div className="flex items-center gap-2">
                  {trendDelta.diff > 0 ? (
                    <ArrowUp className="text-green-600" />
                  ) : trendDelta.diff < 0 ? (
                    <ArrowDown className="text-red-600" />
                  ) : (
                    <span className="text-gray-500">—</span>
                  )}
                  <div className="text-sm">{trendDelta.pct}%</div>
                </div>
              </div>
            </div>

            {/* SPARKLINE */}
            <div>
              <div className="text-sm text-gray-600 mb-2">
                Activity (sparkline)
              </div>
              <div className="h-12 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparkData}>
                    <Line
                      dataKey="count"
                      stroke="#6366F1"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ---------------- RIGHT SIDE ---------------- */}
          <div className="lg:w-[320px]">
            <div className="text-sm text-gray-600 mb-2">
              Class Distribution
            </div>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis
                    dataKey="label"
                    type="category"
                    width={90}
                  />
                  <Tooltip />
                  <Bar dataKey="count">
                    {chartData.map((row) => (
                      <Cell
                        key={row.cls}
                        fill={row.color}
                      />
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
