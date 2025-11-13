"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Smile, Bell } from "lucide-react";

export default function TopStats({ profile }: any) {
  return (
    <div className="grid md:grid-cols-3 gap-6">

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smile className="text-yellow-500" /> Current Mood
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-semibold text-indigo-700">
            {profile?.moodLevel ?? "—"}
          </div>
          <div className="text-sm text-gray-500">on a scale of 1–10</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sleep Patterns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg text-gray-700">
            Avg: <strong>{profile?.sleepHours ?? "—"} hrs</strong>
          </div>
          <div className="text-sm text-gray-500 mt-2">Recommended: 7–8 hrs/day</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="text-red-500" /> Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {profile?.moodLevel < 4 ? (
            <div className="text-red-600 font-medium">
              ⚠️ Low mood detected.
            </div>
          ) : (
            <div className="text-green-600 font-medium">
              😊 You seem to be doing fine!
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
