"use client";

import React, { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type Profile = {
  sleepHours?: number | null;
  exerciseFreq?: string | null;
  waterIntake?: number | null;
  screenTime?: number | null;
};

type Props = { profile?: Profile };

// Dynamic color helper
const getScoreColor = (value: number) => {
  if (value >= 8) return "text-green-600 bg-green-50 border-green-200";
  if (value >= 5) return "text-amber-600 bg-amber-50 border-amber-200";
  return "text-red-600 bg-red-50 border-red-200";
};

export default function HabitScorecards({ profile }: Props) {
  const p = profile ?? {};

  const scores = useMemo(() => {
    const sleep =
      typeof p.sleepHours === "number"
        ? Math.max(0, Math.min(10, Math.round(((p.sleepHours - 4) / 4) * 10)))
        : 5;

    const exercise =
      p.exerciseFreq === "daily"
        ? 9
        : p.exerciseFreq === "3-4"
        ? 7
        : p.exerciseFreq === "occasionally"
        ? 5
        : 3;

    const water =
      typeof p.waterIntake === "number"
        ? Math.min(10, Math.round((p.waterIntake / 3) * 10))
        : 5;

    const screen =
      typeof p.screenTime === "number"
        ? Math.max(0, Math.min(10, Math.round(((12 - p.screenTime) / 12) * 10)))
        : 5;

    return {
      sleep,
      exercise,
      water,
      screen,
      overall: Math.round((sleep + exercise + water + screen) / 4),
    };
  }, [p]);

  const RenderCard = (title: string, value: number, desc: string) => {
    const colorClass = getScoreColor(value);

    return (
      <div
        className={`p-4 rounded-xl border shadow-sm transition-all ${colorClass}`}
      >
        <div className="text-xs text-gray-600">{title}</div>

        <div className="text-3xl font-bold mt-1 animate-opacity-rise">
          {value}/10
        </div>

        <div className="text-xs text-gray-500 mt-2">{desc}</div>
      </div>
    );
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-bold tracking-tight">
          Habit Scorecards
        </CardTitle>
      </CardHeader>

      <CardContent>
        {/* Habit Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {RenderCard("Sleep Quality", scores.sleep, "Based on sleep duration")}
          {RenderCard("Exercise", scores.exercise, "Consistency & frequency")}
          {RenderCard("Hydration", scores.water, "Liters per day")}
          {RenderCard("Screen Time", scores.screen, "Lower is better")}
        </div>

        {/* Overall Score */}
        <div className="mt-5 p-4 rounded-xl bg-indigo-50 border border-indigo-200 shadow-inner">
          <div className="text-sm text-gray-700">Overall Habit Score</div>

          <div className="text-4xl font-extrabold text-indigo-700 mt-1">
            {scores.overall}/10
          </div>

          <div className="text-xs text-gray-600 mt-2">
            Aim for 7+ for a well-balanced lifestyle
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
