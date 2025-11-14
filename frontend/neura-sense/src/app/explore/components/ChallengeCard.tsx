// components/explore/ChallengeCard.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const LS_KEY = "neura_challenge_status_v2";

export default function ChallengeCard() {
  const [accepted, setAccepted] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(()=>{
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw === "accepted") setAccepted(true);
      if (raw === "completed") setCompleted(true);
    } catch {}
  },[]);

  function accept() { setAccepted(true); try { localStorage.setItem(LS_KEY, "accepted"); } catch {} }
  function complete() { setCompleted(true); try { localStorage.setItem(LS_KEY, "completed"); } catch {} }

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="text-yellow-500" /> AI Wellness Challenge</CardTitle></CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">Take a digital detox for 1 hour and go for a short walk.</p>
        {!accepted && !completed && <Button onClick={accept} className="bg-indigo-600 text-white">Accept Challenge</Button>}
        {accepted && !completed && <div className="flex flex-col gap-3 items-center"><div className="text-sm text-gray-600">Challenge in progress</div><Button onClick={complete} className="bg-green-600 text-white">Mark Completed</Button></div>}
        {completed && <div className="text-center"><div className="text-green-600 font-semibold mb-2"><Check /> Completed</div><div className="text-sm text-gray-600">Nice work — keep the momentum!</div></div>}
      </CardContent>
    </Card>
  );
}
