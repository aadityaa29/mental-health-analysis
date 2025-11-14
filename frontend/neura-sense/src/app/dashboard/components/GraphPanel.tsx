"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  AreaChart,
  Area,
  Legend,
  Cell,
} from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import { CLASS_MAP, SENTIMENT_COLORS } from "./constants";

export default function GraphPanel({
  graphType,
  chartData,
  weeklyStability,
}: any) {
  // ────────────────────────────────────────────────
  // Dynamic Color Logic
  // ────────────────────────────────────────────────

  const getMentalColor = (mentalClass: number) => {
    const entry = CLASS_MAP[mentalClass];
    return entry ? entry.color : "#4F46E5"; // fallback indigo
  };

  const getSentimentColor = (value: number) => {
    if (value > 0.2) return SENTIMENT_COLORS.positive;
    if (value < -0.2) return SENTIMENT_COLORS.negative;
    return SENTIMENT_COLORS.neutral;
  };

  // Generate dynamic segment colors for lines
  const mentalStroke = (d: any) => getMentalColor(d.mentalClass ?? d.class ?? 3);
  const sentimentStroke = (d: any) => getSentimentColor(d.sentiment);

  return (
    <Card className="mt-6 shadow-md border border-gray-200 dark:border-gray-800">
      <CardContent className="p-6">
        <div className="h-80 w-full">

          {/* ────────────────────────────────────────────────
              TIME TREND — Dynamic Mental & Sentiment Colors
          ──────────────────────────────────────────────── */}
          {graphType === "time" && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="4 4" stroke="#E5E7EB" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 4]} tick={{ fontSize: 12 }} />

                <Tooltip
                  formatter={(value: any, key: string, entry: any) => {
                    if (key === "mental") {
                      const clsNum = entry.payload.mentalClass;
                      return [`${value} (${CLASS_MAP[clsNum]?.label || "Unknown"})`, "Mental State"];
                    }
                    if (key === "sentiment") {
                      const color = getSentimentColor(value);
                      const label =
                        value > 0.2 ? "Positive" : value < -0.2 ? "Negative" : "Neutral";
                      return [`${value.toFixed(2)} (${label})`, "Sentiment"];
                    }
                    return value;
                  }}
                  contentStyle={{
                    borderRadius: "8px",
                    borderColor: "#E5E7EB",
                    fontSize: "12px",
                  }}
                />

                <Legend wrapperStyle={{ fontSize: "12px", marginTop: "10px" }} />

                {/* Dynamic MENTAL line */}
                <Line
                  type="monotone"
                  dataKey="mental"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  stroke="#4338CA"
                >
                  {chartData.map((entry: any, index: number) => (
                    <Cell key={index} stroke={mentalStroke(entry)} />
                  ))}
                </Line>

                {/* Dynamic SENTIMENT line */}
                <Line
                  type="monotone"
                  dataKey="sentiment"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  stroke="#10B981"
                >
                  {chartData.map((entry: any, index: number) => (
                    <Cell key={index} stroke={sentimentStroke(entry)} />
                  ))}
                </Line>
              </LineChart>
            </ResponsiveContainer>
          )}

          {/* ────────────────────────────────────────────────
              STACKED PROBABILITIES — unchanged except UI
          ──────────────────────────────────────────────── */}
          {graphType === "stacked" && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />

                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    borderColor: "#E5E7EB",
                    fontSize: "12px",
                  }}
                />

                <Legend wrapperStyle={{ fontSize: "12px" }} />

                {[0, 1, 2, 3, 4].map((cls) => (
                  <Bar
                    key={cls}
                    stackId="a"
                    dataKey={(d: any) => d.probs[cls]}
                    name={CLASS_MAP[cls].label}
                    animationDuration={700}
                  >
                    {chartData.map((_: any, i: number) => (
                      <Cell key={i} fill={CLASS_MAP[cls].color} />
                    ))}
                  </Bar>
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}

          {/* ────────────────────────────────────────────────
              Sentiment Area — dynamic sentiment shading
          ──────────────────────────────────────────────── */}
          {graphType === "sentiment" && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 15, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis domain={[-1, 1]} tick={{ fontSize: 12 }} />

                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    borderColor: "#E5E7EB",
                    fontSize: "12px",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="sentiment"
                  stroke="#10B981"
                  strokeWidth={3}
                  fillOpacity={0.25}
                  fill="#10B981"
                  animationDuration={700}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {/* ────────────────────────────────────────────────
              Stability Gauge (unchanged)
          ──────────────────────────────────────────────── */}
          {graphType === "stability" && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-6xl font-extrabold text-indigo-700">
                  {weeklyStability}%
                </div>
                <div className="text-sm text-gray-500 mt-2 tracking-wide">
                  Weekly Emotional Stability
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
