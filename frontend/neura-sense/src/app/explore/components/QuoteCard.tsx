// components/explore/QuoteCard.tsx
"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Heart, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

const QUOTES = [
  "Peace comes from within. Do not seek it without. — Buddha",
  "You, yourself, as much as anybody..., deserve your love — Buddha",
  "Sometimes the most productive thing you can do is relax. — Mark Black",
  "Almost everything will work again if you unplug it for a few minutes, including you. — Anne Lamott",
];

export default function QuoteCard() {
  const [quote] = useState(() => QUOTES[Math.floor(Math.random()*QUOTES.length)]);
  return (
    <Card className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-6 rounded-3xl shadow-md text-center">
      <div className="mx-auto mb-4"><Heart size={36} /></div>
      <h2 className="text-2xl font-semibold mb-4">Today's Mindful Quote</h2>
      <p className="text-lg italic max-w-2xl mx-auto mb-4">{quote}</p>
      <div className="flex justify-center gap-3">
        <Button onClick={() => { navigator.clipboard?.writeText(quote); alert("Copied ✓"); }} variant="outline" className="bg-white bg-opacity-10 text-white"><Copy className="mr-2" size={14} /> Copy Quote</Button>
        <Button onClick={() => alert("Try sharing this quote with a friend — small kindnesses matter!")} variant="ghost" className="text-white">Share</Button>
      </div>
    </Card>
  );
}
