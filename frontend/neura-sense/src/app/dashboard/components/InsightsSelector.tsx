"use client";

import { CLASS_MAP } from "./constants";

export default function InsightsSelector({ graphType, setGraphType }: any) {
  return (
    <div className="mt-10 flex items-center justify-between">

      <h2 className="text-2xl font-bold">Your Mental Health Insights</h2>

      <div className="flex items-center gap-3">
        <select
          value={graphType}
          onChange={(e) => setGraphType(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="time">Time Series</option>
          <option value="stacked">Stacked Probabilities</option>
          <option value="sentiment">Sentiment Area</option>
          <option value="stability">Weekly Stability</option>
        </select>

        <div className="px-3 py-2 rounded bg-gray-50 text-sm text-gray-700">
          <strong>Legend:</strong>
          {Object.entries(CLASS_MAP).map(([k, v]) => (
            <span key={k} className="ml-3 inline-flex items-center">
              <span
                style={{
                  width: 10,
                  height: 10,
                  background: v.color,
                  display: "inline-block",
                  borderRadius: 2,
                  marginRight: 6,
                }}
              />
              {k} → {v.label}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
}
