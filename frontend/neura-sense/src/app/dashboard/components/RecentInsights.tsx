"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CLASS_MAP } from "./constants";

export default function RecentInsights({ mlData }: any) {
  return (
    <Card>
      <CardContent>
        <h3 className="font-semibold text-lg">Recent Text Insights</h3>
        <div className="mt-3 max-h-64 overflow-auto space-y-3">

          {mlData.textInsights.length === 0 && (
            <div className="text-gray-500">No insights yet.</div>
          )}

          {mlData.textInsights.map((entry: any, i: number) => {
            const cls = mlData.mentalHealthVals[i] ?? 3;
            const color = CLASS_MAP[cls]?.color ?? "#111";

            return (
              <div key={i} className="p-2 rounded border">
                <div className="flex justify-between items-center">
                  <div className="font-medium text-sm" style={{ color }}>
                    {CLASS_MAP[cls]?.label}
                  </div>
                  <div className="text-xs text-gray-500">
                    {entry.timestamp
                      ? new Date(entry.timestamp).toLocaleString()
                      : ""}
                  </div>
                </div>

                <div className="text-sm mt-1">{entry.text}</div>

                {typeof entry.vader_compound === "number" && (
                  <div className="text-xs text-gray-500 mt-1">
                    Sentiment: {entry.vader_compound.toFixed(2)}
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
