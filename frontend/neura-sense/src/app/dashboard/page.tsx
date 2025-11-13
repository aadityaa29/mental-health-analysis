// src/app/dashboard/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

// Components
import Header from "./components/Header";
import TopStats from "./components/TopStats";
import InsightsSelector from "./components/InsightsSelector";
import ConditionCard from "./components/ConditionCard";
import GraphPanel from "./components/GraphPanel";
import RecentInsights from "./components/RecentInsights";
import WordFrequency from "./components/WordFrequency";
import StabilityAdvice from "./components/StabilityAdvice";
import LegendFooter from "./components/LegendFooter";
import PredictionSummary from "./components/PredictionSummary";

// NEW PANELS
import SpotifyMoodRhythm from "./components/SpotifyMoodRhythm";
import TwitterSentimentTrend from "./components/TwitterSentimentTrend";
import DeepPersonalityInsights from "./components/DeepPersonalityInsights";
import HabitScorecards from "./components/HabitScorecards";
import SleepCycleRadar from "./components/SleepCycleRadar";
import TriggerWordsDetector from "./components/TriggerWordsDetector";

import {
  SpotifyTrack,
  TweetItem,
  TraitsMap,
  SleepMetrics,
} from "./components/constants";


type RecentInsight = {
  text?: string;
  prediction?: number | string;
  date?: string;
  timestamp?: number;
  vader_compound?: number;
  probs?: number[];
  probabilities?: Record<string, number>;
};

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ML Data
  const [mlData, setMlData] = useState({
    condition: "—",
    textInsights: [] as RecentInsight[],
    mentalHealthVals: [] as number[],
    sentimentVals: [] as number[],
    probsArray: [] as number[][],
    lastRun: undefined as string | undefined,
  });

  const [graphType, setGraphType] = useState<
    "time" | "stacked" | "sentiment" | "stability"
  >("time");

  /* -------------------------
     AUTH + LOAD + PREDICT
  ----------------------------*/
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      setUser(currentUser);
      await triggerPredictAndLoad(currentUser.uid);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  async function triggerPredictAndLoad(uid: string) {
    setRefreshing(true);

    try {
      await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: uid }),
      });
    } catch (err) {
      console.warn("Prediction API failed", err);
    }

    // Load Firestore
    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return;

    const data = snap.data();
    setProfile(data);

    const recent = (data?.recent_text_insights as RecentInsight[]) ?? [];
    const mental_preds = (data?.mental_health_preds as number[]) ?? [];
    const sentiment_preds = (data?.sentiment_preds as number[]) ?? [];

    const mentalVals: number[] = [];
    const sentimentVals: number[] = [];
    const probsArr: number[][] = [];

    recent.forEach((entry, i) => {
      const p =
        typeof entry.prediction === "number"
          ? entry.prediction
          : mental_preds[i] ?? 3;

      mentalVals.push(p);

      const vader =
        typeof entry.vader_compound === "number"
          ? entry.vader_compound
          : sentiment_preds[i] ?? 0;

      sentimentVals.push(vader);

      const probs = entry.probs ?? [0, 0, 0, 0, 0];
      probsArr.push(probs);
    });

    setMlData({
      condition: data?.most_probable_condition ?? "—",
      textInsights: recent,
      mentalHealthVals: mentalVals,
      sentimentVals: sentimentVals,
      probsArray: probsArr,
      lastRun: data?.last_analysis_run ?? undefined,
    });

    setRefreshing(false);
  }

  /* -------------------------
     CLEAN CHART DATA
  ----------------------------*/
  const chartData = useMemo(() => {
    return mlData.textInsights.map((entry, i) => {
      const dateISO =
        entry.date ??
        (entry.timestamp ? new Date(entry.timestamp).toISOString() : undefined);

      return {
        label: dateISO
          ? new Date(dateISO).toLocaleDateString()
          : `Entry ${i + 1}`,
        date: dateISO,
        mental: mlData.mentalHealthVals[i] ?? 3,
        sentiment: mlData.sentimentVals[i] ?? 0,
        probs: mlData.probsArray[i] ?? [0, 0, 0, 0, 0],
        text: entry.text ?? "",
      };
    });
  }, [mlData]);

  /* -------------------------
     WEEKLY STABILITY
  ----------------------------*/
  const weeklyStability = useMemo(() => {
    if (!chartData.length) return 100;
    const last7 = chartData.slice(-7).map((d) => d.mental);
    const mean = last7.reduce((a, b) => a + b, 0) / last7.length;
    const variance =
      last7.reduce((s, v) => s + (v - mean) ** 2, 0) / last7.length;
    const std = Math.sqrt(variance);
    const stability = Math.max(0, 1 - std / 2);
    return Math.round(stability * 100);
  }, [chartData]);

  /* -------------------------
     WORD CLOUD
  ----------------------------*/
  const topWords = useMemo(() => {
    const text = mlData.textInsights.map((x) => x.text).join(" ");
    const cleaned = text
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(" ")
      .filter((w) => w.length > 2);
    const freq: Record<string, number> = {};
    cleaned.forEach((w) => (freq[w] = (freq[w] || 0) + 1));
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([w, c]) => ({ word: w, count: c }));
  }, [mlData]);

  /* -------------------------
     PLACEHOLDERS matching component types
     (replace with real Firestore fetch later)
  ----------------------------*/
  const spotifyTracks: SpotifyTrack[] = []; // SpotifyTrack defined in constants
 const twitterTweets: TweetItem[] = []; // TwitterTweet defined in constants

  const llmTraits: TraitsMap = {
  openness: 0,
  conscientiousness: 0,
  extraversion: 0,
  agreeableness: 0,
  neuroticism: 0,
};
const sleepMetrics: SleepMetrics = {
  sleepHours: 7,
  bedtimeConsistency: 0.8,
  wakeConsistency: 0.75,
  sleepQuality: 0.7,
};


  /* -------------------------
     RENDER
  ----------------------------*/
  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <Header
          user={user}
          profile={profile}
          lastRun={mlData.lastRun}
          refreshing={refreshing}
          triggerPredictAndLoad={triggerPredictAndLoad}
        />

        <TopStats profile={profile} />

        <InsightsSelector graphType={graphType} setGraphType={setGraphType} />
        <ConditionCard condition={mlData.condition} />

        <GraphPanel
          graphType={graphType}
          chartData={chartData}
          weeklyStability={weeklyStability}
        />

        {/* Additional AI Sections */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SpotifyMoodRhythm tracks={spotifyTracks} />
          <TwitterSentimentTrend tweets={twitterTweets} />
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DeepPersonalityInsights traits={llmTraits} />
          <HabitScorecards profile={profile} />
        </div>  

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SleepCycleRadar metrics={sleepMetrics} />
          <TriggerWordsDetector insights={mlData.textInsights} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <RecentInsights mlData={mlData} />
          <WordFrequency topWords={topWords} />
          <StabilityAdvice weeklyStability={weeklyStability} condition={mlData.condition} />
        </div>

        <PredictionSummary mlData={mlData} />
        <LegendFooter />
      </div>
    </main>
  );
}
