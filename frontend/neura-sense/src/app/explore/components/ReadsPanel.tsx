// components/explore/ReadsPanel.tsx
"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BookOpen, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const READS = [
  { id: "r1", title: "Microbreaks: Why Short Pauses Help", lead: "Little breaks improve attention.", body: "Take short breaks of 2–5 minutes. Try a stretch or breathing." },
  { id: "r2", title: "Grounding Tools for Anxiety", lead: "Reconnect to present.", body: "Name 5 things you see, 4 you can touch — combine with breathing." },
];

export default function ReadsPanel() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<typeof READS[0] | null>(null);

  function openRead(r: typeof READS[0]) { setSelected(r); setOpen(true); }
  function close() { setOpen(false); setSelected(null); }

  return (
    <>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="text-teal-600" /> Mindfulness Reads</CardTitle></CardHeader>
        <CardContent>
          <div className="text-gray-700 mb-3">Short articles you can read in under 3 minutes.</div>
          <div className="space-y-3">
            {READS.map(r=>(
              <div key={r.id} className="p-2 rounded hover:bg-gray-50 transition">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold">{r.title}</div>
                    <div className="text-xs text-gray-500">{r.lead}</div>
                  </div>
                  <div><Button size="sm" variant="outline" onClick={()=>openRead(r)}>Read</Button></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {open && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
          <motion.div initial={{ scale:0.98, opacity:0 }} animate={{ scale:1, opacity:1 }} transition={{ duration:0.18 }} className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-6 relative">
            <button aria-label="Close" onClick={close} className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"><X /></button>
            <h3 className="text-lg font-semibold mb-2">{selected.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{selected.lead}</p>
            <div className="text-gray-700 leading-relaxed">{selected.body}</div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => { navigator.clipboard?.writeText(selected.body); alert("Copied ✓"); }}>Copy</Button>
              <Button onClick={close}>Close</Button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
