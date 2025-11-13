"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CLASS_MAP } from "./constants";

export default function ConditionCard({ condition }: any) {
  const color =
    Object.values(CLASS_MAP).find((c) => c.label === condition)?.color ??
    "#111";

  return (
    <Card className="mt-4">
      <CardContent>
        <div className="text-gray-600">Most Probable Condition</div>
        <div className="text-3xl font-semibold" style={{ color }}>
          {condition}
        </div>
      </CardContent>
    </Card>
  );
}
