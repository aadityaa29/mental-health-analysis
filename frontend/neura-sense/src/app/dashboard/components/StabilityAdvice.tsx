"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function StabilityAdvice({ weeklyStability, condition }: any) {
  let msg = "You look stable!";
  let level = "low";

  if (condition.toLowerCase().includes("depress") && weeklyStability < 60) {
    msg =
      "Recurring depressive signals + low stability detected. Consider a wellness check-in.";
    level = "high";
  } else if (
    condition.toLowerCase().includes("anxiety") &&
    weeklyStability < 70
  ) {
    msg = "Anxiety indicators present. Try deep breathing or grounding.";
    level = "medium";
  }

  return (
    <Card>
      <CardContent>
        <h3 className="font-semibold">Stability & Advice</h3>
        <div className="mt-3">
          <div className="mb-3">
            Weekly Stability: <strong>{weeklyStability}%</strong>
          </div>

          <div
            className={`p-3 rounded ${
              level === "high"
                ? "bg-red-50 text-red-700"
                : level === "medium"
                ? "bg-yellow-50 text-yellow-700"
                : "bg-green-50 text-green-700"
            }`}
          >
            {msg}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
