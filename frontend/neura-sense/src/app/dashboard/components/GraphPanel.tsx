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
import { CLASS_MAP } from "./constants";

export default function GraphPanel({
  graphType,
  chartData,
  weeklyStability,
}: any) {
  return (
    <Card className="mt-6">
      <CardContent>
        <div className="h-80">
          {/* --- Time Series Line Chart --- */}
          {graphType === "time" && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis domain={[0, 4]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="mental"
                  stroke="#4F46E5"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="sentiment"
                  stroke="#F97316"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          )}

          {/* --- Stacked Probabilities --- */}
          {graphType === "stacked" && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />

                {[0, 1, 2, 3, 4].map((cls: number) => (
                  <Bar
                    key={cls}
                    dataKey={(d: any) => d.probs[cls]}
                    stackId="a"
                    name={CLASS_MAP[cls].label}
                  >
                    {chartData.map((_: any, i: number) => (
                      <Cell key={i} fill={CLASS_MAP[cls].color} />
                    ))}
                  </Bar>
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}

          {/* --- Sentiment Area --- */}
          {graphType === "sentiment" && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis domain={[-1, 1]} />
                <Tooltip />
                <Area dataKey="sentiment" stroke="#10B981" fill="#D1FAE5" />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {/* --- Stability Gauge --- */}
          {graphType === "stability" && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-6xl font-bold text-indigo-700">
                  {weeklyStability}%
                </div>
                <div className="text-sm text-gray-600 mt-2">
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
