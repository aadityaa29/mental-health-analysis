// src/app/dashboard/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

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

import { useGlobalLoader } from "@/components/global-loader/LoaderContext";


// =========================
// TYPES
// =========================
type RecentInsight = {
  text?: string;
  prediction?: number | string;
  date?: string;
  timestamp?: number;
  vader_compound?: number;
  probs?: number[]; 
};

type TextLevelItem = {
  raw_text: string;
  cleaned_text?: string;
  prediction_label?: string;
  prediction_value?: number;
  sentiment?: number;
  timestamp: number;
  probs?: number[];
};


// =========================
// MAIN PAGE
// =========================
export default function DashboardPage() {
  const router = useRouter();
  const { showLoader, hideLoader } = useGlobalLoader();

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);

  const [refreshing, setRefreshing] = useState(false);

  const [spotifyTracks, setSpotifyTracks] = useState<SpotifyTrack[]>([]);
  const [twitterTweets, setTwitterTweets] = useState<TweetItem[]>([]);

  const [mlData, setMlData] = useState({
    condition: "—",
    textInsights: [] as RecentInsight[],
    text_level_analysis: [] as TextLevelItem[],
    mentalHealthVals: [] as number[],
    sentimentVals: [] as number[],
    probsArray: [] as number[][],
    lastRun: undefined as string | undefined,
  });

  const [graphType, setGraphType] = useState<
    "time" | "stacked" | "sentiment" | "stability"
  >("time");


  // =========================
  // AUTH + INITIAL LOAD
  // =========================
  useEffect(() => {
    showLoader();

    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        hideLoader();
        router.push("/login");
        return;
      }

      setUser(currentUser);
      await triggerPredictAndLoad(currentUser.uid);
      await loadCachedFeeds(currentUser.uid);

      hideLoader();
    });

    return () => unsub();
  }, []);


  // =========================
  // FIRESTORE: Load Spotify + Twitter Cache
  // =========================
  async function loadCachedFeeds(uid: string) {
    // ---- TWITTER ----
    const twitterRef = doc(db, "users", uid, "cache", "twitter");
    const tSnap = await getDoc(twitterRef);
    if (tSnap.exists()) {
      const items = tSnap.data()?.items ?? [];
      const mapped = items.map((it: any, i: number) => ({
        id: String(i),
        text: it.text,
        timestamp: it.timestamp,
        sentiment: it.sentiment ?? undefined,
      }));
      setTwitterTweets(mapped);
    }

    // ---- SPOTIFY ----
    const spotifyRef = doc(db, "users", uid, "cache", "spotify");
    const sSnap = await getDoc(spotifyRef);
    if (sSnap.exists()) {
      const items = sSnap.data()?.items ?? [];
      const mapped = items.map((t: any) => ({
        name: t.name,
        played_at: t.played_at,
        valence: t.valence,
        energy: t.energy,
      }));
      setSpotifyTracks(mapped);
    }
  }


  // =========================
  // PREDICT API + SAVE RESULTS
  // =========================
  async function triggerPredictAndLoad(uid: string) {
    setRefreshing(true);
    showLoader();

    try {
      await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: uid }),
      });
    } catch (err) {
      console.warn("Prediction API failed →", err);
    }

    // FIRESTORE LOAD
    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) {
      hideLoader();
      return;
    }

    const data = snap.data();
    setProfile(data);

    const recent = (data?.recent_text_insights as TextLevelItem[]) ?? [];
    const mental_preds = (data?.mental_health_preds as number[]) ?? [];
    const sentiment_preds = (data?.sentiment_preds as number[]) ?? [];

    const mentalVals: number[] = [];
    const sentimentVals: number[] = [];
    const probsArr: number[][] = [];

    recent.forEach((entry, i) => {
      mentalVals.push(entry.prediction_value ?? mental_preds[i] ?? 3);
      sentimentVals.push(entry.sentiment ?? sentiment_preds[i] ?? 0);
      probsArr.push(entry.probs ?? [0, 0, 0, 0, 0]);
    });

    setMlData({
      condition: data?.most_probable_condition ?? "—",
      textInsights: recent,
      text_level_analysis: recent,
      mentalHealthVals: mentalVals,
      sentimentVals: sentimentVals,
      probsArray: probsArr,
      lastRun: data?.last_analysis_run,
    });

    setRefreshing(false);
    hideLoader();
  }


  // =========================
  // CHART DATA
  // =========================
  const chartData = useMemo(() => {
    return mlData.text_level_analysis.map((entry, i) => ({
      label: new Date(entry.timestamp).toLocaleDateString(),
      date: new Date(entry.timestamp).toISOString(),
      mental: mlData.mentalHealthVals[i],
      sentiment: mlData.sentimentVals[i],
      probs: mlData.probsArray[i],
      text: entry.raw_text,
    }));
  }, [mlData]);


  // =========================
  // WORD FREQUENCY
  // =========================
  const topWords = useMemo(() => {
    if (!mlData.text_level_analysis.length) return [];

    const text = mlData.text_level_analysis
      .map((item) => item.cleaned_text || item.raw_text)
      .join(" ");

    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2);

    const freq: Record<string, number> = {};
    words.forEach((w) => (freq[w] = (freq[w] || 0) + 1));

    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([word, count]) => ({ word, count }));
  }, [mlData.text_level_analysis]);


  // =========================
  // PLACEHOLDER TRAITS + SLEEP
  // =========================
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


  // =========================
  // RENDER
  // =========================
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
          weeklyStability={0}
        />

        {/* FINAL FIX — PASS REAL CACHED DATA */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SpotifyMoodRhythm tracks={spotifyTracks} />
          <TwitterSentimentTrend tweets={twitterTweets} />
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DeepPersonalityInsights traits={llmTraits} />
          <HabitScorecards profile={profile} />
        </div>

        <TriggerWordsDetector
          insights={mlData.text_level_analysis.map((item) => ({
            text: item.raw_text,
            timestamp: item.timestamp,
          }))}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <RecentInsights mlData={mlData} />
          <WordFrequency topWords={topWords} />
          <StabilityAdvice weeklyStability={100} condition={mlData.condition} />
        </div>

        <PredictionSummary mlData={mlData} />
        <LegendFooter />
      </div>
    </main>
  );
}
