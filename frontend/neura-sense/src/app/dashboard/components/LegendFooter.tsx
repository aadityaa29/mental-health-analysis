"use client";

import { CLASS_MAP } from "./constants";

export default function LegendFooter() {
  return (
    <div className="mt-8 p-4 rounded bg-white border">
      <h4 className="font-semibold mb-2">Class Meaning</h4>

      <div className="flex gap-6">
        {Object.entries(CLASS_MAP).map(([k, v]) => (
          <div key={k} className="flex items-center gap-2">
            <span
              style={{
                width: 12,
                height: 12,
                background: v.color,
                display: "inline-block",
                borderRadius: 2,
              }}
            />
            <div>
              <div className="text-sm font-medium">
                {k} → {v.label}
              </div>
              <div className="text-xs text-gray-500">{v.label} zone</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
