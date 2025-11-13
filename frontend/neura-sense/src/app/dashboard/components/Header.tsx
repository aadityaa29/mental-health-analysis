"use client";

import { Button } from "@/components/ui/button";
import { Brain, Loader2 } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Header({
  user,
  profile,
  lastRun,
  refreshing,
  triggerPredictAndLoad,
}: any) {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold text-indigo-700 flex items-center gap-3">
        <Brain className="w-8 h-8" />
        Welcome, {profile?.profileName || user?.displayName || "User"} 🧠
      </h1>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-sm text-gray-500">Last analysis</div>
          <div className="font-medium">
            {lastRun ? new Date(lastRun).toLocaleString() : "—"}
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => user && triggerPredictAndLoad(user.uid)}
        >
          {refreshing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Refresh Insights"
          )}
        </Button>

        {/* <Button
          variant="ghost"
          onClick={() => {
            signOut(auth);
            window.location.href = "/login";
          }}
        >
          Logout
        </Button> */}
      </div>
    </div>
  );
}
