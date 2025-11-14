"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Brush,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SENTIMENT_COLORS } from "./constants";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

type TweetItem = {
  id?: string;
  text: string;
  timestamp: number;
  sentiment?: number;
};

export default function TwitterSentimentTrend({
  tweets: propTweets,
}: {
  tweets?: TweetItem[];
}) {
  const [cacheTweets, setCacheTweets] = useState<TweetItem[]>([]);

  // Load tweets from Firestore cache
  useEffect(() => {
    const loadCache = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const ref = doc(db, "users", user.uid, "cache", "twitter");
      const snap = await getDoc(ref);

      if (!snap.exists()) return;

      const data = snap.data();
      const items = (data?.items || []) as any[];

      const mapped = items.map((it: any, i: number) => ({
        id: it.id ?? String(i),
        text: it.text,
        timestamp: it.timestamp,
        sentiment: it.sentiment ?? undefined,
      }));

      setCacheTweets(mapped);
    };

    loadCache();
  }, []);

  // If props provided → use them; else → use cached tweets
  const srcTweets = propTweets?.length ? propTweets : cacheTweets;

  // Convert to chart-friendly format
  const data = useMemo(() => {
    if (!srcTweets || srcTweets.length === 0) return fallbackTweets();

    return srcTweets
      .map((t) => {
        const sent =
          typeof t.sentiment === "number"
            ? t.sentiment
            : heuristicSentiment(t.text);

        return {
          timestamp: t.timestamp, // ⭐ REQUIRED
          label: new Date(t.timestamp).toLocaleDateString(),
          timeLabel: new Date(t.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          sentiment: Number(sent.toFixed(2)),
          text: t.text,
          id: t.id ?? Math.random().toString(36).slice(2, 9),
        };
      })
      .sort((a, b) => a.timestamp - b.timestamp); // ⭐ SORT BY RAW TIMESTAMP
  }, [srcTweets]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-indigo-700 font-bold">
          Twitter Sentiment Trend
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.4} />

              <XAxis dataKey="label" />
              <YAxis domain={[-1, 1]} />

              <Tooltip
                formatter={(val) => [val, "Sentiment Score"]}
                labelFormatter={(label, payload) => {
                  const p = payload?.[0]?.payload;
                  return `${p?.timeLabel ?? label} — ${
                    p?.text?.slice(0, 90) ?? ""
                  }`;
                }}
                contentStyle={{
                  borderRadius: 10,
                  borderColor: "#6366F1",
                }}
              />

              <Line
                type="monotone"
                dataKey="sentiment"
                stroke={SENTIMENT_COLORS.positive}
                strokeWidth={2}
                dot={{ r: 3 }}
              />

              <Brush dataKey="label" height={20} stroke="#6366F1" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <p className="text-xs text-gray-500 mt-3">
          Sentiment: -1 (negative) → +1 (positive). Data fetched from your
          Twitter activity.
        </p>
      </CardContent>
    </Card>
  );
}

/* ------------------------------
   Simple fallback sentiment
--------------------------------*/
function heuristicSentiment(text: string): number {
  const t = text.toLowerCase();
  const positiveWords = ["happy", "good", "great", "love", "excited", "awesome"];
  const negativeWords = ["sad", "bad", "angry", "anxious", "depressed", "stress"];

  let score = 0;
  positiveWords.forEach((w) => t.includes(w) && (score += 0.3));
  negativeWords.forEach((w) => t.includes(w) && (score -= 0.3));

  return Math.max(-1, Math.min(1, score));
}

/* ------------------------------
   Fallback (UI never breaks)
--------------------------------*/
function fallbackTweets(): any[] {
  const now = Date.now();
  return [
    {
      text: "Connect Twitter to view your real sentiment timeline.",
      timestamp: now - 86400000,
      sentiment: 0,
    },
    {
      text: "This is sample data only.",
      timestamp: now - 3600000,
      sentiment: 0.1,
    },
  ];
}
