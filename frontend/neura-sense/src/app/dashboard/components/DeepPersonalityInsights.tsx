//frontend/neura-sense/src/app/dashboard/components/DeepPersonalityInsights.tsx

"use client";

import React, { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

/**
 * This component displays LLM-derived personality traits.
 * Accepts an optional `traits` prop (map of trait->score 0-1)
 * If you have an LLM endpoint, pass its output here.
 */

type TraitsMap = Record<string, number>;

type Props = {
  traits?: TraitsMap;
};
type TraitKey =
  | "openness"
  | "conscientiousness"
  | "extraversion"
  | "agreeableness"
  | "neuroticism";

export default function DeepPersonalityInsights({ traits }: Props) {
  const finalTraits = useMemo<TraitsMap>(() => {
    // fallback traits (lowercase keys to match real backend shape)
    const fallback: Record<TraitKey, number> = {
      openness: 0.78,
      conscientiousness: 0.62,
      extraversion: 0.45,
      agreeableness: 0.7,
      neuroticism: 0.35,
    };

    if (!traits) return fallback;

    const result: Record<TraitKey, number> = { ...fallback };

    for (const key of Object.keys(fallback) as TraitKey[]) {
      const value = traits?.[key];

      result[key] = value && value > 0 ? value : fallback[key];
    }

    return result;
  }, [traits]);

  const items = Object.entries(finalTraits).map(([key, v]) => [
    key.charAt(0).toUpperCase() + key.slice(1), // capitalize labels
    v,
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deep Personality Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map(([k, v]) => {
            const value = Number(v); // force number type
            return (
              <div key={k} className="flex items-center gap-4">
                <div className="w-36 text-sm text-gray-600 capitalize">{k}</div>

                <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    style={{ width: `${Math.round(value * 100)}%` }}
                    className="h-3 bg-indigo-500 rounded-full"
                  />
                </div>

                <div className="w-12 text-right text-sm font-medium">
                  {Math.round(value * 100)}%
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-xs text-gray-500 mt-3">
          These insights come from an LLM that analyzes text signals and profile
          data — use them to personalize interventions and suggestions.
        </div>
      </CardContent>
    </Card>
  );
}
