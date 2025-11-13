"use client";

import React, { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

/**
 * TriggerWordsDetector
 * - Accepts textInsights array (strings) or will compute from ML text insights
 * - Shows top trigger words and example snippets when clicked
 */

type Insight = {
  text?: string;
  timestamp?: number | string;
};

type Props = {
  insights?: Insight[];
  topN?: number;
};

export default function TriggerWordsDetector({ insights, topN = 12 }: Props) {
  const items = insights ?? fallbackInsights();
  const [selected, setSelected] = useState<string | null>(null);

  const topWords = useMemo(() => {
    const text = items.map((t) => t.text || "").join(" ");
    const cleaned = text
      .toLowerCase()
      .replace(/https?:\/\/\S+/g, "")
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter(Boolean)
      .filter((w) => w.length > 2 && !["the","and","for","you","your","that","this","with","have","just","not"].includes(w));

    const freq: Record<string, number> = {};
    const examples: Record<string, string[]> = {};
    for (const t of items) {
      const s = (t.text || "").toLowerCase();
      for (const w of cleaned) {
        if (!examples[w]) examples[w] = [];
      }
    }

    for (const s of items) {
      const txt = (s.text || "").toLowerCase();
      const words = txt.split(/\s+/);
      const uniq = Array.from(new Set(words));
      for (const w of uniq) {
        if (!w || w.length <= 2) continue;
        if (["the","and","for","you","your","that","this","with","have","just","not"].includes(w)) continue;
        freq[w] = (freq[w] || 0) + (txt.split(w).length - 1);
        if ((examples[w] || []).length < 3 && txt.includes(w)) {
          examples[w] = [...(examples[w] || []), (s.text || "").slice(0, 140)];
        }
      }
    }

    const arr = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([word, count]) => ({ word, count, examples: examples[word] ?? [] }));

    return arr;
  }, [items, topN]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trigger Words Detector</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 flex-wrap">
          {topWords.length === 0 && <div className="text-gray-500">No trigger words found.</div>}
          {topWords.map((w) => (
            <button
              key={w.word}
              onClick={() => setSelected(w.word === selected ? null : w.word)}
              className={`px-3 py-1 rounded-full border ${selected === w.word ? "bg-indigo-600 text-white" : "bg-indigo-50 text-gray-800"}`}
            >
              {w.word} <span className="text-xs ml-2 text-gray-500">({w.count})</span>
            </button>
          ))}
        </div>

        {selected && (
          <div className="mt-4">
            <div className="text-sm font-medium">Examples for “{selected}”</div>
            <div className="mt-2 space-y-2">
              {topWords.find((t) => t.word === selected)?.examples.map((ex, i) => (
                <div key={i} className="p-2 rounded border bg-white text-sm">{ex}</div>
              ))}
            </div>
            <div className="text-xs text-gray-500 mt-2">Tap a word to view example snippets where it appears.</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function fallbackInsights(): Insight[] {
  const now = Date.now();
  return [
    { text: "I am so anxious about the interview", timestamp: new Date(now - 86400000 * 2).toISOString() },
    { text: "Nothing seems to be working, feeling depressed", timestamp: new Date(now - 86400000).toISOString() },
    { text: "Had a panic attack after seeing the message", timestamp: new Date(now - 3600000).toISOString() },
    { text: "I enjoy coding and exploring new things", timestamp: new Date(now - 600000).toISOString() },
  ];
}
