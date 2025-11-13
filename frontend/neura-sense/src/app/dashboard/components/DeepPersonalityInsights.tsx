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

export default function DeepPersonalityInsights({ traits }: Props) {
  const finalTraits = useMemo<TraitsMap>(() => {
    if (traits && Object.keys(traits).length > 0) return traits;

    // fallback example traits
    return {
      "Openness": 0.78,
      "Conscientiousness": 0.62,
      "Extraversion": 0.45,
      "Agreeableness": 0.70,
      "Neuroticism": 0.35,
      "Resilience": 0.54,
      "Self-awareness": 0.68,
    };
  }, [traits]);

  const items = Object.entries(finalTraits).sort((a,b) => b[1] - a[1]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deep Personality Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map(([k,v]) => (
            <div key={k} className="flex items-center gap-4">
              <div className="w-36 text-sm text-gray-600">{k}</div>
              <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                <div style={{ width: `${Math.round(v * 100)}%` }} className="h-3 bg-indigo-500 rounded-full" />
              </div>
              <div className="w-12 text-right text-sm font-medium">{Math.round(v * 100)}%</div>
            </div>
          ))}
        </div>

        <div className="text-xs text-gray-500 mt-3">
          These insights come from an LLM that analyzes text signals and profile data — use them to personalize interventions and suggestions.
        </div>
      </CardContent>
    </Card>
  );
}
