// components/explore/GroundingCarousel.tsx
"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const GROUNDING = [
  { title: "Name 5 things you see", desc: "Scan the scene and silently name five visible objects to anchor attention." },
  { title: "Relax jaw, drop shoulders", desc: "Unclench your jaw and let shoulders drop for 10 seconds." },
  { title: "Box Breathing", desc: "Inhale 4s → Hold 4s → Exhale 4s → Hold 4s. Repeat for 4 cycles." },
  { title: "Tapping exercise", desc: "Gently tap your hands and collarbone in a slow rhythm for 20s." },
];

export default function GroundingCarousel() {
  const [idx, setIdx] = useState(0);
  const cur = GROUNDING[idx];

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Heart className="text-pink-500" /> Grounding Exercises</CardTitle></CardHeader>
      <CardContent>
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">{cur.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{cur.desc}</p>
          </div>
          <div className="flex flex-col gap-2">
            <Button variant="outline" onClick={()=>setIdx((i)=> (i - 1 + GROUNDING.length) % GROUNDING.length)}><ChevronLeft /></Button>
            <Button variant="outline" onClick={()=>setIdx((i)=> (i + 1) % GROUNDING.length)}><ChevronRight /></Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
