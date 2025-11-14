"use client";

import { Card, CardContent } from "@/components/ui/card";

type WordFreqItem = {
  word: string;
  count: number;
};

type Props = {
  topWords?: WordFreqItem[];
};

export default function WordFrequency({ topWords = [] }: Props) {
  return (
    <Card>
      <CardContent>
        <h3 className="font-semibold">Word Frequency</h3>

        <div className="mt-3 flex flex-wrap gap-2">
          {/* If nothing found */}
          {topWords.length === 0 && (
            <div className="text-gray-500">No words found.</div>
          )}

          {/* Render words */}
          {topWords.map((w) => (
            <span
              key={w.word}
              className="px-3 py-1 bg-indigo-50 rounded-full text-sm"
            >
              {w.word}
              <span className="text-xs text-gray-500 ml-2">
                ({w.count})
              </span>
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
