"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { auth, db } from "@/lib/firebase";
import { signOut, onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Loader2, Brain, Bell, Smile } from "lucide-react";
import { getAuth } from "firebase/auth";


export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const handleConnect = async () => {
    const user = getAuth().currentUser;
    if (!user) {
      alert("Please sign in first.");
      return;
    }

    const url = `/api/connect/twitter?uid=${user.uid}`;
    window.location.href = url; // Redirects to Twitter OAuth
  };

async function connectReddit() {
  const user = getAuth().currentUser;
  if (!user) {
    alert("You must be signed in!");
    return;
  }

  const token = await user.getIdToken();
  window.location.href = `/api/auth/reddit?token=${token}`;
}
async function connectSpotify() {
  const user = getAuth().currentUser;
  if (!user) {
    alert("You must be signed in!");
    return;
  }

  const token = await user.getIdToken();
  window.location.href = `/api/auth/spotify?token=${token}`;
}

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }
      setUser(currentUser);

      // Fetch user profile from Firestore
      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setProfile(userSnap.data());
      } else {
        router.push("/profile-setup");
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-indigo-50 to-white">
        <Loader2 className="animate-spin text-indigo-600 w-8 h-8" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white px-6 py-10">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-700 flex items-center gap-2">
            <Brain className="w-7 h-7" /> Welcome,{" "}
            {profile?.name || user?.displayName || "User"} 🧠
          </h1>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {/* Dashboard Content */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid md:grid-cols-3 gap-6"
        >
          {/* Mood Summary Card */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smile className="text-yellow-500" /> Current Mood
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-semibold text-indigo-700">
                {profile?.moodLevel ?? "—"}
              </p>
              <p className="text-gray-500 mt-1">on a scale of 1–10</p>
            </CardContent>
          </Card>

          {/* Sleep Info */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Sleep Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                You’ve been averaging{" "}
                <span className="font-semibold">
                  {profile?.sleepHours ?? "—"} hrs
                </span>{" "}
                of sleep.
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Recommended: 7–8 hours/day
              </p>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="text-red-500" /> Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile?.moodLevel && profile?.moodLevel < 4 ? (
                <p className="text-red-600 font-medium">
                  ⚠️ Your recent mood is low. Try taking a short break or
                  journaling today.
                </p>
              ) : (
                <p className="text-green-600 font-medium">
                  😊 You seem to be doing fine! Keep up your positive habits.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Insights Section */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-12"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Behavioral Insights
          </h2>
          <p className="text-gray-600">
            Based on your connected social media data, NeuraSense will soon
            provide insights like:
          </p>
          <ul className="list-disc pl-5 text-gray-600 mt-3 space-y-1">
            <li>Detect mood swings through text & posting frequency</li>
            <li>Analyze stress levels via engagement & sentiment</li>
            <li>Recommend personalized coping techniques</li>
          </ul>
        </motion.section>
      </div>

      <button
      onClick={handleConnect}
      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
    >
      Connect Twitter
    </button>

    <Button
  variant="outline"
  onClick={connectReddit}
>
  Connect Reddit
</Button>

<Button
  variant="outline"
  onClick={connectSpotify}
>
  Connect Spotify
</Button>

    </main>
  );
}
