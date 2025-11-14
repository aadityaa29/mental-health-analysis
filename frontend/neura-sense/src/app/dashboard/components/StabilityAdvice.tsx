"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function StabilityAdvice({
  weeklyStability,
  condition = "Normal",
}: any) {
  const cond = String(condition || "normal").toLowerCase();

  let message = "You seem mentally stable this week. Keep going! 🌿";
  let level: "low" | "medium" | "high" = "low";

  // ---- HIGH RISK CONDITIONS ----
  if ((cond.includes("depress") || cond.includes("ptsd")) && weeklyStability < 60) {
    message =
      "Low emotional stability + depressive/PTSD markers detected. Consider taking a break, journaling, or reaching out for support. 💛";
    level = "high";
  }

  // ---- MEDIUM RISK ----
  else if (cond.includes("anxiety") && weeklyStability < 70) {
    message =
      "Anxiety indicators with moderate instability. Try grounding exercises or slow breathing. 🌬️";
    level = "medium";
  }

  // ---- BIPOLAR CHECK ----
  else if (cond.includes("bipolar") && weeklyStability < 65) {
    message =
      "Mood fluctuation patterns detected. Keeping routines consistent may help stabilize your week. 🌗";
    level = "medium";
  }

  // ---- NORMAL BUT LOW STABILITY ----
  else if (cond.includes("normal") && weeklyStability < 50) {
    message =
      "Even though overall patterns look normal, your stability is low this week. Make space to rest and reset. 🌱";
    level = "medium";
  }

  // ---- VERY STABLE ----
  else if (weeklyStability >= 80) {
    message =
      "Great emotional stability this week! Continue practicing whatever is working for you. ✨";
    level = "low";
  }

  return (
    <Card>
      <CardContent>
        <h3 className="font-semibold">Stability & Advice</h3>

        <div className="mt-3 space-y-3">
          <div className="text-sm text-gray-600">
            Weekly Stability:{" "}
            <strong className="text-indigo-700">{weeklyStability}%</strong>
          </div>

          <div
            className={`p-3 rounded-lg border text-sm transition-all ${
              level === "high"
                ? "bg-red-50 text-red-700 border-red-200"
                : level === "medium"
                ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                : "bg-green-50 text-green-700 border-green-200"
            }`}
          >
            {message}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
