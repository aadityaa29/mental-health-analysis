"use client";

import React, { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

/**
 * HabitScorecards computes quick habit scores from profile values.
 * Props: profile object (sleepHours:number, exerciseFreq:string, waterIntake:number, screenTime:number)
 */

type Profile = {
  sleepHours?: number | null;
  exerciseFreq?: string | null;
  waterIntake?: number | null;
  screenTime?: number | null;
};

type Props = {
  profile?: Profile;
};

export default function HabitScorecards({ profile }: Props) {
  const p = profile ?? {};

  const scores = useMemo(() => {
    const sleep = typeof p.sleepHours === "number" ? Math.max(0, Math.min(10, Math.round(((p.sleepHours - 4) / 4) * 10))) : 5;
    const exercise = (p.exerciseFreq === "daily" ? 9 : p.exerciseFreq === "3-4" ? 7 : p.exerciseFreq === "occasionally" ? 5 : 3);
    const water = typeof p.waterIntake === "number" ? Math.min(10, Math.round((p.waterIntake / 3) * 10)) : 5;
    const screen = typeof p.screenTime === "number" ? Math.max(0, Math.min(10, Math.round(((12 - p.screenTime) / 12) * 10))) : 5;

    return {
      sleep, exercise, water, screen,
      overall: Math.round((sleep + exercise + water + screen) / 4),
    };
  }, [p]);

  const card = (title: string, value: number, desc: string) => (
    <div className="p-4 rounded-lg border bg-white">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold text-indigo-700">{value}/10</div>
      <div className="text-xs text-gray-500 mt-1">{desc}</div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Habit Scorecards</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {card("Sleep Quality", scores.sleep, "Based on average sleep hours")}
          {card("Exercise", scores.exercise, "Frequency & consistency")}
          {card("Hydration", scores.water, "Liters / day relative score")}
          {card("Screen Time", scores.screen, "Lower is better")}
        </div>

        <div className="mt-4 rounded p-3 bg-indigo-50">
          <div className="text-sm text-gray-700">Overall Habit Score</div>
          <div className="text-3xl font-bold">{scores.overall}/10</div>
          <div className="text-xs text-gray-600 mt-2">Higher is better — aim for 7+</div>
        </div>
      </CardContent>
    </Card>
  );
}
