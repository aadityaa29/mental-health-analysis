// dashboard/components/constants.ts

/* ----------------------------------------------
   MH CLASS MAPPING
----------------------------------------------*/
export const CLASS_MAP: Record<number, { label: string; color: string }> = {
  0: { label: "Anxiety", color: "#F59E0B" },
  1: { label: "Bipolar", color: "#FBBF24" },
  2: { label: "Depression", color: "#EF4444" },
  3: { label: "Normal", color: "#10B981" },
  4: { label: "PTSD", color: "#8B5CF6" },
};

/* ----------------------------------------------
   COLORS
----------------------------------------------*/
export const SENTIMENT_COLORS = {
  positive: "#10B981",
  neutral: "#6B7280",
  negative: "#EF4444",
};

export const SPOTIFY_MOOD_COLORS = {
  energetic: "#F97316",
  calm: "#3B82F6",
  sad: "#EF4444",
  happy: "#10B981",
  neutral: "#6B7280",
};

/* ----------------------------------------------
   TYPE: SpotifyTrack (MATCHES SpotifyMoodRhythm)
----------------------------------------------*/
export type SpotifyTrack = {
  name: string;
  played_at: string; // ISO
  valence: number;   // 0–1
  energy: number;    // 0–1
};

/* ----------------------------------------------
   TYPE: TweetItem (MATCHES TwitterSentimentTrend)
----------------------------------------------*/
export type TweetItem = {
  id: string;
  text: string;
  sentiment: number; // -1..1
  created_at: string; // MUST be string
};

/* ----------------------------------------------
   TYPE: TraitsMap (MATCHES DeepPersonalityInsights)
----------------------------------------------*/
export type TraitsMap = Record<string, number>;

/* ----------------------------------------------
   TYPE: SleepMetrics (MATCHES SleepCycleRadar)
----------------------------------------------*/
export type SleepMetrics = {
  sleepHours?: number;
  bedtimeConsistency?: number;
  wakeConsistency?: number;
  sleepQuality?: number;
};
