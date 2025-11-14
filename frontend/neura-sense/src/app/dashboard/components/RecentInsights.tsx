"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CLASS_MAP } from "./constants";

export default function RecentInsights({ mlData }: any) {
  const insights = mlData?.textInsights ?? [];

  return (
    <Card>
      <CardContent>
        <h3 className="font-semibold text-lg text-indigo-700">
          Recent Text Insights
        </h3>

        <div className="mt-4 max-h-72 overflow-auto space-y-3 pr-1 custom-scroll">
          {insights.length === 0 && (
            <div className="text-gray-500 text-sm">No insights yet.</div>
          )}

          {insights.map((entry: any, i: number) => {
            const cls = mlData.mentalHealthVals?.[i] ?? 3;
            const color = CLASS_MAP[cls]?.color ?? "#111";

            return (
              <div
                key={i}
                className="p-3 rounded-lg border bg-white hover:shadow-sm transition-shadow"
              >
                {/* Header Row */}
                <div className="flex items-center justify-between mb-1">
                  {/* Condition label */}
                  <span
                    className="text-sm font-semibold"
                    style={{ color }}
                  >
                    {CLASS_MAP[cls]?.label}
                  </span>

                  {/* Timestamp */}
                  <span className="text-xs text-gray-500">
                    {entry.timestamp
                      ? new Date(entry.timestamp).toLocaleString()
                      : ""}
                  </span>
                </div>

                {/* Insight Text */}
                <div className="text-sm text-gray-700 leading-relaxed">
                  {entry.text}
                </div>

                {/* Sentiment */}
                {typeof entry.vader_compound === "number" && (
                  <div className="text-xs text-gray-500 mt-2">
                    Sentiment Score:{" "}
                    <span
                      className={
                        entry.vader_compound > 0
                          ? "text-green-600"
                          : entry.vader_compound < 0
                          ? "text-red-500"
                          : "text-gray-600"
                      }
                    >
                      {entry.vader_compound.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
