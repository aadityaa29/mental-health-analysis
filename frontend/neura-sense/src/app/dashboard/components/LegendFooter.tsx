"use client";

import { CLASS_MAP } from "./constants";

export default function LegendFooter() {
  return (
    <div className="mt-8 p-5 rounded-xl bg-white border shadow-sm">
      <h4 className="font-semibold mb-3 text-gray-800">
        Mental Health Class Legend
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(CLASS_MAP).map(([key, value]) => (
          <div
            key={key}
            className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition"
          >
            {/* Color Box */}
            <span
              className="mt-1 inline-block rounded"
              style={{
                width: 14,
                height: 14,
                background: value.color,
              }}
            />

            {/* Labels */}
            <div>
              <div className="text-sm font-semibold text-gray-700">
                {value.label}
              </div>

              <div className="text-xs text-gray-500">
                Class {key} — {value.label} Zone
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-4">
        These classes are generated from your mental-health model predictions and
        reflect emotional/behavioral patterns detected across your activities.
      </p>
    </div>
  );
}
