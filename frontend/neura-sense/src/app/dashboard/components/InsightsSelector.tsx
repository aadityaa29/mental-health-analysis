"use client";

import { CLASS_MAP } from "./constants";

export default function InsightsSelector({ graphType, setGraphType }: any) {
  return (
    <div className="mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

      {/* Title */}
      <h2 className="text-2xl font-bold tracking-tight">
        Your Mental Health Insights
      </h2>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">

        {/* Graph Type Selector */}
        <select
          value={graphType}
          onChange={(e) => setGraphType(e.target.value)}
          className="
            border px-3 py-2 rounded-lg bg-white dark:bg-gray-900 
            shadow-sm text-sm focus:ring-2 focus:ring-indigo-500
          "
        >
          <option value="time">Time Series</option>
          <option value="stacked">Stacked Probabilities</option>
          <option value="sentiment">Sentiment Area</option>
          <option value="stability">Weekly Stability</option>
        </select>

        {/* Legend */}
        <div
          className="
            px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 
            text-sm flex flex-wrap gap-3 shadow-sm
          "
        >
          <strong className="text-gray-700 dark:text-gray-300">
            Legend:
          </strong>

          {Object.entries(CLASS_MAP).map(([k, v]) => (
            <span
              key={k}
              className="
                inline-flex items-center px-2 py-1 rounded-md 
                bg-white dark:bg-gray-900 shadow-sm text-xs font-medium
              "
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  backgroundColor: v.color,
                  borderRadius: 2,
                  marginRight: 6,
                }}
              />
              {v.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
