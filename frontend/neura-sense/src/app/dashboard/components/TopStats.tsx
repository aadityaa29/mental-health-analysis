"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Smile, Bell } from "lucide-react";

export default function TopStats({ profile }: { profile?: any }) {
  const mood = Number(profile?.moodLevel ?? 0);
  const sleepHours = Number(profile?.sleepHours ?? 0);

  // Mood interpretation
  let moodLabel = "—";
  let moodColor = "text-gray-400";
  let moodEmoji = "😐";

  if (mood > 0) {
    if (mood <= 3) {
      moodLabel = "Low";
      moodColor = "text-red-500";
      moodEmoji = "😔";
    } else if (mood <= 6) {
      moodLabel = "Moderate";
      moodColor = "text-yellow-500";
      moodEmoji = "🙂";
    } else {
      moodLabel = "High";
      moodColor = "text-green-600";
      moodEmoji = "😄";
    }
  }

  // Alerts logic (smarter)
  let alertMsg = "😊 You seem to be doing fine!";
  let alertColor = "text-green-600";

  if (mood > 0 && mood <= 3) {
    alertMsg = "⚠️ Low mood detected. Stay mindful today.";
    alertColor = "text-red-600";
  } else if (sleepHours > 0 && sleepHours < 6) {
    alertMsg = "⚠️ Low sleep duration. Consider resting more.";
    alertColor = "text-orange-600";
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">

      {/* ----------- Mood ------------- */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smile className="text-yellow-500" /> Current Mood
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-4xl font-bold ${moodColor} flex items-center gap-2`}>
            {mood || "—"} <span className="text-3xl">{moodEmoji}</span>
          </div>
          <div className="text-sm text-gray-500">Scale: 1–10 ({moodLabel})</div>
        </CardContent>
      </Card>

      {/* ----------- Sleep Patterns ------------- */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Sleep Patterns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg text-gray-700">
            Avg Sleep:{" "}
            <strong className="text-indigo-700">{sleepHours || "—"} hrs</strong>
          </div>
          <div className="text-sm text-gray-500 mt-2">
            Recommended: 7–8 hrs/day
          </div>
        </CardContent>
      </Card>

      {/* ----------- Alerts ------------- */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="text-red-500" /> Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`font-medium ${alertColor}`}>{alertMsg}</div>
        </CardContent>
      </Card>

    </div>
  );
}
