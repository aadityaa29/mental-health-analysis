"use client";

import { Button } from "@/components/ui/button";
import { Brain, Loader2, LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Header({
  user,
  profile,
  lastRun,
  refreshing,
  triggerPredictAndLoad,
}: any) {
  const username = profile?.profileName || user?.displayName || "User";

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
      
      {/* ─────────────── TITLE ─────────────── */}
      <h1 className="text-3xl font-bold text-indigo-700 flex items-center gap-3 drop-shadow-sm">
        <Brain className="w-8 h-8 text-indigo-600" />
        <span className="animate-fade-in">
          Welcome, <span className="text-indigo-800">{username}</span> 🧠
        </span>
      </h1>

      {/* ─────────────── RIGHT ACTIONS ─────────────── */}
      <div className="flex items-center gap-6">
        
        {/* Last Run Time */}
        <div className="text-right">
          <div className="text-sm text-gray-500">Last analysis</div>
          <div className="font-medium text-gray-800 dark:text-gray-200">
            {lastRun ? new Date(lastRun).toLocaleString() : "—"}
          </div>
        </div>

        {/* Refresh Button */}
        <Button
          variant="outline"
          className="shadow-sm hover:shadow transition-all"
          onClick={() => user && triggerPredictAndLoad(user.uid)}
        >
          {refreshing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Refresh Insights"
          )}
        </Button>

        {/* Logout Button (optional: visible if needed) */}
        {/* 
        <Button
          variant="ghost"
          className="text-red-500 hover:text-red-600 transition"
          onClick={() => {
            signOut(auth);
            window.location.href = "/login";
          }}
        >
          <LogOut className="w-4 h-4 mr-1" />
          Logout
        </Button>
        */}
      </div>
    </div>
  );
}
