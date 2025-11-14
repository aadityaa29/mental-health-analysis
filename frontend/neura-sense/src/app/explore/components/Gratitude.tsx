// components/explore/Gratitude.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sun, Copy } from "lucide-react";
import { motion } from "framer-motion";

const LS_KEY = "neura_gratitude_entries_v2";

export default function Gratitude() {
  const [text, setText] = useState("");
  const [entries, setEntries] = useState<string[]>([]);
  const [savedAnim, setSavedAnim] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setEntries(JSON.parse(raw));
    } catch {}
  }, []);

  function persist(next:string[]) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch {}
  }

  function save() {
    if (!text.trim()) return;
    const next = [text.trim(), ...entries].slice(0, 50);
    setEntries(next);
    setText("");
    persist(next);
    setSavedAnim(true);
    setTimeout(() => setSavedAnim(false), 1200);
    // small toast
    const el = document.createElement("div");
    el.textContent = "Saved — nice! ✨";
    el.style.position = "fixed";
    el.style.bottom = "18px";
    el.style.left = "50%";
    el.style.transform = "translateX(-50%)";
    el.style.padding = "8px 12px";
    el.style.background = "rgba(0,0,0,0.75)";
    el.style.color = "white";
    el.style.borderRadius = "10px";
    document.body.appendChild(el);
    setTimeout(()=>el.remove(), 1400);
  }

  function remove(i:number) {
    const next = entries.filter((_, idx)=> idx !== i);
    setEntries(next);
    persist(next);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Sun className="text-yellow-500" /> Daily Gratitude</CardTitle>
      </CardHeader>
      <CardContent>
        <textarea value={text} onChange={(e)=>setText(e.target.value)} placeholder="I'm grateful for..." className="w-full p-3 rounded border focus:outline-none focus:ring" rows={3} />
        <div className="flex gap-2 mt-3 items-center">
          <Button onClick={save}>Save</Button>
          <Button variant="outline" onClick={() => setText("")}>Clear</Button>
          {savedAnim && <motion.div animate={{ scale: [0.8,1.2,1], opacity:[0,1,1] }} transition={{ duration: 0.9 }} className="ml-2 text-green-600 font-semibold">Saved ✓</motion.div>}
        </div>

        <div className="mt-4 space-y-2 max-h-44 overflow-auto">
          {entries.length === 0 && <div className="text-sm text-gray-500">No entries yet — try one now!</div>}
          {entries.map((g,i)=>(
            <div key={i} className="flex items-start justify-between gap-2 p-2 rounded bg-gray-50">
              <div className="text-sm text-gray-700">{g}</div>
              <div className="flex gap-2 items-center">
                <button onClick={() => { navigator.clipboard?.writeText(g); alert("Copied ✓"); }} title="Copy" className="text-gray-500"><Copy size={14} /></button>
                <button onClick={()=>remove(i)} title="Delete" className="text-red-500">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
