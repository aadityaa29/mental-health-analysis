"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CLASS_MAP } from "./constants";

export default function ConditionCard({ condition }: any) {
  const match = Object.values(CLASS_MAP).find(
    (c) => c.label.toLowerCase() === condition?.toLowerCase()
  );

  const color = match?.color ?? "#333";

  // Soft background tint
  const bgTint = `${color}15`; // 15 = ~8% opacity hex

  return (
    <Card
      className="mt-4 border rounded-xl shadow-sm transition-all"
      style={{ borderColor: color }}
    >
      <CardContent
        className="p-5 rounded-xl"
        style={{ backgroundColor: bgTint }}
      >
        <div className="text-sm text-gray-700 mb-1">
          Most Probable Condition
        </div>

        <div
          className="text-3xl font-bold tracking-wide"
          style={{ color }}
        >
          {condition || "Unknown"}
        </div>
      </CardContent>
    </Card>
  );
}
