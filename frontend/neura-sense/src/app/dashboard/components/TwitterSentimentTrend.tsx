"use client";

import React, { useMemo } from "react";
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

type TweetItem = {
  id?: string;
  text: string;
  created_at: string; // ISO
  sentiment?: number; // -1..1 (VADER or model)
};

type Props = {
  tweets?: TweetItem[];
};

export default function TwitterSentimentTrend({ tweets }: Props) {
  // fallback/mock tweets
  const data = useMemo(() => {
    const src =
      tweets && tweets.length > 0
        ? tweets
        : fallbackTweets();

    return src
      .map((t) => ({
        label: new Date(t.created_at).toLocaleDateString(),
        timeLabel: new Date(t.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        sentiment: typeof t.sentiment === "number" ? Number(t.sentiment.toFixed(2)) : 0,
        text: t.text,
        id: t.id ?? Math.random().toString(36).slice(2, 9),
      }))
      .sort((a, b) => new Date(a.label).getTime() - new Date(b.label).getTime());
  }, [tweets]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Twitter Sentiment Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tickFormatter={(v) => new Date(v).toLocaleDateString()} />
              <YAxis domain={[-1, 1]} />
              <Tooltip
                formatter={(value: any) => [value, "Sentiment"]}
                labelFormatter={(label: string, payload: any) => {
                  const p = payload?.[0]?.payload;
                  return `${p?.timeLabel ?? label} — ${p?.text?.slice(0, 80) ?? ""}`;
                }}
              />
              <Line type="monotone" dataKey="sentiment" stroke={SENTIMENT_COLORS.positive} strokeWidth={2} dot={{ r: 3 }} />
              <Brush dataKey="label" height={20} stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="text-xs text-gray-500 mt-3">
          Sentiment range: -1 (negative) → +1 (positive). Data sources: connected Twitter.
        </div>
      </CardContent>
    </Card>
  );
}

function fallbackTweets(): TweetItem[] {
  const now = Date.now();
  return [
    { text: "Feeling anxious today about exams", created_at: new Date(now - 86400000 * 3).toISOString(), sentiment: -0.6 },
    { text: "Had a good walk and fresh air", created_at: new Date(now - 86400000 * 2).toISOString(), sentiment: 0.5 },
    { text: "Work has been stressful", created_at: new Date(now - 86400000).toISOString(), sentiment: -0.3 },
    { text: "Reading a book is calming", created_at: new Date(now - 3600000).toISOString(), sentiment: 0.4 },
  ];
}
