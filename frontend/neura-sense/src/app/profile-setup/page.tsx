// src/app/profile-setup/page.tsx
"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  Fragment,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Twitter, MessageSquare, Music, Check, X } from "lucide-react";

import { auth, db } from "@/lib/firebase";
import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  collection,
  getDocs,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";
import { onAuthStateChanged, getAuth } from "firebase/auth";

/* -------------------
   Types
   ------------------- */
type ConnectedAccounts = {
  twitter: boolean;
  reddit: boolean;
  spotify: boolean;
};

type DraftProfile = {
  name?: string;
  age?: number | "";
  gender?: string;
  city?: string;
  occupation?: string;
  preferredTheme?: string;
  studyPattern?: string;
  sleepHours?: number | "";
  exerciseFreq?: string;
  screenTime?: number | "";
  stressLevel?: number;
  waterIntake?: number | "";
  smokingDrinking?: string;
  wakeUpTime?: string;
  bedTime?: string;
  mood?: number;
  communicationStyle?: string;
  interests?: string[];
  weekendPref?: string;
  updatedAt?: string | null; // store ISO string for local display
};

/* -------------------
   Component
   ------------------- */
export default function ProfileSetupPage() {
  const router = useRouter();
  const search = useSearchParams();
  // after OAuth redirect we pass ?oauth=reddit or ?oauth=spotify or ?oauth=twitter
  const oauthProvider = search?.get("oauth") ?? null;

  // auth + loading
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // draft and ref to draft doc
  const [draft, setDraft] = useState<DraftProfile>({});
  const draftRef = useRef<any | null>(null);

  // saving indicator + debounce timer
  const [saving, setSaving] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // unsaved changes tracking
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // connected social tokens (reads /users/{uid}/tokens)
  const [connected, setConnected] = useState<ConnectedAccounts>({
    twitter: false,
    reddit: false,
    spotify: false,
  });

  // step UI (1..4)
  const [step, setStep] = useState<number>(1);

  // interest input
  const [interestInput, setInterestInput] = useState("");

  // mood options
  const moodOptions = [
    { id: 1, emoji: "😞", label: "Very Low" },
    { id: 2, emoji: "😕", label: "Low" },
    { id: 3, emoji: "😐", label: "Okay" },
    { id: 4, emoji: "🙂", label: "Good" },
    { id: 5, emoji: "😊", label: "Very Good" },
    { id: 6, emoji: "😄", label: "Happy" },
    { id: 7, emoji: "😁", label: "Excited" },
    { id: 8, emoji: "🤩", label: "Energetic" },
    { id: 9, emoji: "🤗", label: "Loved" },
    { id: 10, emoji: "😍", label: "Excellent" },
  ];

  /* -------------------
     Auth + load draft + tokens
     ------------------- */
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.push("/login");
        return;
      }
      setUser(u);

      // setup draft doc reference
      const dRef = doc(db, "profiles", u.uid, "draft", "info");
      draftRef.current = dRef;

      // realtime sync draft
      const unsubDraft = onSnapshot(dRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data() as any;
          // If Firestore stores updatedAt as a Timestamp, convert to ISO string for UI:
          const updatedAt: any = data?.updatedAt;
          const updatedAtIso =
            updatedAt && typeof updatedAt.toDate === "function"
              ? updatedAt.toDate().toISOString()
              : updatedAt || null;

          setDraft((prev) => ({
            ...prev,
            ...data,
            updatedAt: updatedAtIso,
          }));
          // when server-snapshot arrives, treat as saved
          setUnsavedChanges(false);
          setSaving(false);
        } else {
          // keep current local draft (no server draft yet)
          setDraft((prev) => ({ ...prev }));
        }
      });

      // load tokens once (not realtime)
      const tokensCol = collection(db, "users", u.uid, "tokens");
      const loadTokens = async () => {
        try {
          const docs = await getDocs(tokensCol);
          const present: ConnectedAccounts = {
            twitter: false,
            reddit: false,
            spotify: false,
          };
          docs.forEach((d) => {
            const id = d.id.toLowerCase();
            if (id.includes("reddit")) present.reddit = true;
            if (id.includes("twitter")) present.twitter = true;
            if (id.includes("spotify")) present.spotify = true;
          });
          setConnected(present);
        } catch (err) {
          console.warn("Failed to load tokens", err);
        }
      };
      loadTokens();

      return () => {
        unsubDraft();
      };
    });

    return () => unsubAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  /* -------------------
     Auto-save helpers
     ------------------- */
  const scheduleAutoSave = useCallback(
    (field: string, value: any) => {
      if (!user) {
        // still update local only
        setDraft((d) => ({ ...d, [field]: value }));
        setUnsavedChanges(true);
        return;
      }

      // update local draft quickly
      setDraft((d: any) => ({ ...d, [field]: value }));
      setUnsavedChanges(true);

      // debounce writes
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }

      saveTimer.current = setTimeout(async () => {
        try {
          setSaving(true);
          const dRef = doc(db, "profiles", user.uid, "draft", "info");
          // write the single changed field and a server timestamp (merge)
          await setDoc(
            dRef,
            { [field]: value, updatedAt: serverTimestamp() },
            { merge: true }
          );
          // local immediate reflection: use local Date ISO for quicker UI update
          const nowIso = new Date().toISOString();
          setDraft((d) => ({ ...d, updatedAt: nowIso }));
          setUnsavedChanges(false);
          setSaving(false);
          // toast with readable local time
          toast.success(`Draft saved · ${new Date(nowIso).toLocaleString()}`, {
            id: `draft-saved-${nowIso}`,
          });
        } catch (err) {
          console.error("Auto-save failed", err);
          setSaving(false);
          setUnsavedChanges(true);
          toast.error("Auto-save failed");
        }
      }, 800);
    },
    [user]
  );

  // immediate full save (used before redirecting to OAuth or finalizing)
  const saveDraftNow = useCallback(async (): Promise<boolean> => {
    if (!user) {
      toast.error("Not signed in");
      return false;
    }
    try {
      setSaving(true);
      const dRef = doc(db, "profiles", user.uid, "draft", "info");
      // write entire draft state
      await setDoc(dRef, { ...(draft || {}), updatedAt: serverTimestamp() }, { merge: true });
      // set local updatedAt quickly
      const nowIso = new Date().toISOString();
      setDraft((d) => ({ ...d, updatedAt: nowIso }));
      setUnsavedChanges(false);
      setSaving(false);
      toast.success(`Draft saved · ${new Date(nowIso).toLocaleString()}`);
      return true;
    } catch (err) {
      console.error("Failed to save draft", err);
      setSaving(false);
      setUnsavedChanges(true);
      toast.error("Could not save your progress. Try again.");
      return false;
    }
  }, [user, draft]);

  // field change helper typed
  const handleFieldChange = (field: keyof DraftProfile, value: any) => {
    scheduleAutoSave(field as string, value);
  };

  /* -------------------
     OAuth connect handlers (save draft first, then confirm)
     ------------------- */

  // state for OAuth-confirm modal
  const [oauthConfirm, setOauthConfirm] = useState<{
    provider: "reddit" | "spotify" | "twitter" | null;
    open: boolean;
  }>({ provider: null, open: false });

  // state for post-OAuth modal
  const [postOauthModal, setPostOauthModal] = useState<{
    provider: string | null;
    open: boolean;
  }>({ provider: null, open: false });

  const startOauthFlow = async (provider: "reddit" | "spotify" | "twitter") => {
    // Save draft then open confirm modal (so user can cancel)
    setLoading(true);
    const ok = await saveDraftNow();
    setLoading(false);
    if (!ok) return;
    // open confirm modal
    setOauthConfirm({ provider, open: true });
  };

  const confirmOauthRedirect = async () => {
    const provider = oauthConfirm.provider;
    if (!provider || !user) {
      setOauthConfirm({ provider: null, open: false });
      return;
    }

    setOauthConfirm({ provider: null, open: false });
    setLoading(true);
    try {
      const currentUser = getAuth().currentUser;
      if (!currentUser) throw new Error("Not authenticated");

      const token = await currentUser.getIdToken();

      if (provider === "reddit") {
        window.location.href = `/api/auth/reddit?token=${token}`;
      } else if (provider === "spotify") {
        window.location.href = `/api/auth/spotify?token=${token}`;
      } else if (provider === "twitter") {
        // your Twitter route expects uid param in your implementation
        window.location.href = `/api/connect/twitter?uid=${currentUser.uid}`;
      }
    } catch (err) {
      console.error("OAuth redirect failed", err);
      toast.error("Failed to start OAuth.");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------
     Post-OAuth handling (user returned from provider)
     - Show toast + modal asking to connect more or continue
     ------------------- */
  useEffect(() => {
    // If oauthProvider param exists we re-check tokens and show post-OAuth modal
    if (!user || !oauthProvider) return;

    (async () => {
      try {
        const tokensSnapshot = await getDocs(collection(db, "users", user.uid, "tokens"));
        const present: ConnectedAccounts = { twitter: false, reddit: false, spotify: false };
        tokensSnapshot.forEach((d) => {
          const id = d.id.toLowerCase();
          if (id.includes("reddit")) present.reddit = true;
          if (id.includes("twitter")) present.twitter = true;
          if (id.includes("spotify")) present.spotify = true;
        });
        setConnected(present);

        // show toast if newly connected
        toast.success(`${oauthProvider} connected!`);

        // open small modal asking next steps
        setPostOauthModal({ provider: oauthProvider, open: true });
      } catch (err) {
        console.warn("Could not refresh tokens after OAuth", err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oauthProvider, user]);

  const postOauthChoice = (choice: "more" | "dashboard") => {
    setPostOauthModal({ provider: null, open: false });
    if (choice === "dashboard") {
      router.push("/dashboard");
    } else {
      // stay on step 4 for more connections
      setStep(4);
    }
  };

  /* -------------------
     Disconnect handler
     - deletes /users/{uid}/tokens/{providerDoc}
     ------------------- */
  const handleDisconnect = async (providerKey: string) => {
    if (!user) return;
    try {
      // delete doc under /users/{uid}/tokens/{providerKey}
      await deleteDoc(doc(db, "users", user.uid, "tokens", providerKey));
      // reload tokens
      const docs = await getDocs(collection(db, "users", user.uid, "tokens"));
      const present: ConnectedAccounts = { twitter: false, reddit: false, spotify: false };
      docs.forEach((d) => {
        const id = d.id.toLowerCase();
        if (id.includes("reddit")) present.reddit = true;
        if (id.includes("twitter")) present.twitter = true;
        if (id.includes("spotify")) present.spotify = true;
      });
      setConnected(present);
      toast.success(`${providerKey} disconnected`);
    } catch (err) {
      console.warn("Failed to disconnect", err);
      toast.error("Failed to disconnect");
    }
  };

  /* -------------------
     finalize profile (draft -> profiles + mirror to users)
     ------------------- */
  const handleSaveAndContinue = async () => {
    if (!user) return;
    const atLeastOneConnected = Object.values(connected).some(Boolean);
    if (!atLeastOneConnected) {
      toast.error("Please connect at least one social account before continuing.");
      return;
    }
    setLoading(true);
    try {
      const profileRef = doc(db, "profiles", user.uid);
      const draftRefLocal = doc(db, "profiles", user.uid, "draft", "info");
      const snap = await getDoc(draftRefLocal);
      if (!snap.exists()) {
        toast.error("No profile data to save.");
        setLoading(false);
        return;
      }
      const data = snap.data() || {};

      // write finalized profile
      await setDoc(profileRef, { ...data, finalizedAt: serverTimestamp() }, { merge: true });

      // mirror light summary to /users/{uid}
      const userRef = doc(db, "users", user.uid);
      const mirror = {
        profileName: data.name || user.displayName || null,
        moodLevel: data.mood || null,
        sleepHours: data.sleepHours || null,
        lastProfileSaved: serverTimestamp(),
      };
      await setDoc(userRef, mirror, { merge: true });

      toast.success("Profile saved. Redirecting to dashboard...");
      router.push("/dashboard");
    } catch (err) {
      console.error("Failed to finalize profile", err);
      toast.error("Failed to save profile. Try again.");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------
     interests helpers
     ------------------- */
  const addInterest = () => {
    const v = (interestInput || "").trim();
    if (!v) return;
    const next = Array.from(new Set([...(draft.interests || []), v]));
    handleFieldChange("interests", next);
    setInterestInput("");
  };

  const removeInterest = (t: string) => {
    const next = (draft.interests || []).filter((x: string) => x !== t);
    handleFieldChange("interests", next);
  };

  const atLeastOneConnected = Object.values(connected).some(Boolean);

  /* -------------------
     BEFOREUNLOAD handler (browser unload only)
     Show confirmation only if unsavedChanges is true
     ------------------- */
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!unsavedChanges) return;
      e.preventDefault();
      e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
      return e.returnValue;
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [unsavedChanges]);

  /* -------------------
     Render UI
     ------------------- */
  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-start justify-center py-12 px-4 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-4xl"
      >
        <Card className="rounded-2xl shadow-xl border border-indigo-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-100 via-white to-indigo-50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Let’s set up your profile 🌿</h2>
                <p className="text-sm text-gray-600 mt-1">We’ll personalize your mental health analysis.</p>
              </div>

              <div className="text-right">
                <div className="text-xs text-gray-500">Step</div>
                <div className="mt-1 inline-flex items-center gap-3">
                  <div className="px-3 py-1 rounded-full text-sm bg-indigo-600 text-white">{step}/4</div>
                  <div className="text-xs text-gray-500">Progress</div>
                </div>
              </div>
            </div>
          </div>

          <CardContent className="p-6">
            {/* --- STEP 1: Basic Info --- */}
            {step === 1 && (
              <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Full name</Label>
                    <Input
                      value={draft.name ?? ""}
                      onChange={(e) => handleFieldChange("name", e.target.value)}
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <Label>Age</Label>
                    <Input
                      type="number"
                      value={draft.age ?? ""}
                      onChange={(e) => handleFieldChange("age", e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="e.g. 20"
                    />
                  </div>

                  <div>
                    <Label>Gender</Label>
                    <select
                      value={draft.gender ?? ""}
                      onChange={(e) => handleFieldChange("gender", e.target.value)}
                      className="w-full border rounded-lg p-2"
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not">Prefer not to say</option>
                    </select>
                  </div>

                  <div>
                    <Label>Location / City</Label>
                    <Input value={draft.city ?? ""} onChange={(e) => handleFieldChange("city", e.target.value)} placeholder="City" />
                  </div>

                  <div>
                    <Label>Occupation / Profession</Label>
                    <Input
                      value={draft.occupation ?? ""}
                      onChange={(e) => handleFieldChange("occupation", e.target.value)}
                      placeholder="e.g. Student / Developer"
                    />
                  </div>

                  <div>
                    <Label>Study Routine Pattern</Label>
                    <select
                      value={draft.studyPattern ?? ""}
                      onChange={(e) => handleFieldChange("studyPattern", e.target.value)}
                      className="w-full border rounded-lg p-2"
                    >
                      <option value="">Select</option>
                      <option value="morning">Morning</option>
                      <option value="night">Night</option>
                      <option value="flexible">Flexible</option>
                    </select>
                  </div>

                  <div>
                    <Label>Preferred Theme</Label>
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => handleFieldChange("preferredTheme", "light")}
                        className={`px-3 py-1 rounded-lg border ${draft.preferredTheme === "light" ? "bg-white ring-2 ring-indigo-200" : "bg-transparent"}`}
                      >
                        Light
                      </button>
                      <button
                        onClick={() => handleFieldChange("preferredTheme", "dark")}
                        className={`px-3 py-1 rounded-lg border ${draft.preferredTheme === "dark" ? "bg-black text-white ring-2 ring-indigo-200" : "bg-transparent"}`}
                      >
                        Dark
                      </button>
                      <button
                        onClick={() => handleFieldChange("preferredTheme", "system")}
                        className={`px-3 py-1 rounded-lg border ${(!draft.preferredTheme || draft.preferredTheme === "system") ? "bg-indigo-50 ring-2 ring-indigo-200" : "bg-transparent"}`}
                      >
                        System
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <div />
                  <Button onClick={() => setStep(2)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    Next
                  </Button>
                </div>
              </motion.section>
            )}

            {/* --- STEP 2: Health & habits --- */}
            {step === 2 && (
              <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Health & daily habits</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Average sleep (hrs)</Label>
                    <Input
                      value={draft.sleepHours ?? ""}
                      onChange={(e) => handleFieldChange("sleepHours", e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="e.g. 7"
                    />
                  </div>

                  <div>
                    <Label>Exercise frequency</Label>
                    <select value={draft.exerciseFreq ?? ""} onChange={(e) => handleFieldChange("exerciseFreq", e.target.value)} className="w-full border rounded-lg p-2">
                      <option value="">Select</option>
                      <option value="daily">Daily</option>
                      <option value="3-4">3-4 times/week</option>
                      <option value="occasionally">Occasionally</option>
                      <option value="never">Never</option>
                    </select>
                  </div>

                  <div>
                    <Label>Average screen time (hrs/day)</Label>
                    <Input
                      value={draft.screenTime ?? ""}
                      onChange={(e) => handleFieldChange("screenTime", e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="e.g. 6"
                    />
                  </div>

                  <div>
                    <Label>Stress level</Label>
                    <div className="mt-2 flex items-center gap-3">
                      <input
                        type="range"
                        min={1}
                        max={10}
                        value={draft.stressLevel ?? 5}
                        onChange={(e) => handleFieldChange("stressLevel", Number(e.target.value))}
                        className="w-full"
                      />
                      <div className="w-12 text-sm text-gray-700">{draft.stressLevel ?? 5}</div>
                    </div>
                  </div>

                  <div>
                    <Label>Water intake (liters/day)</Label>
                    <Input
                      value={draft.waterIntake ?? ""}
                      onChange={(e) => handleFieldChange("waterIntake", e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="e.g. 2"
                    />
                  </div>

                  <div>
                    <Label>Smoking / Drinking</Label>
                    <select value={draft.smokingDrinking ?? ""} onChange={(e) => handleFieldChange("smokingDrinking", e.target.value)} className="w-full border rounded-lg p-2">
                      <option value="">Select</option>
                      <option value="none">None</option>
                      <option value="occasionally">Occasionally</option>
                      <option value="regularly">Regularly</option>
                    </select>
                  </div>

                  <div>
                    <Label>Wake-up time</Label>
                    <Input type="time" value={draft.wakeUpTime ?? ""} onChange={(e) => handleFieldChange("wakeUpTime", e.target.value)} />
                  </div>

                  <div>
                    <Label>Bedtime</Label>
                    <Input type="time" value={draft.bedTime ?? ""} onChange={(e) => handleFieldChange("bedTime", e.target.value)} />
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button onClick={() => setStep(3)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    Next
                  </Button>
                </div>
              </motion.section>
            )}

            {/* --- STEP 3: Personality & Interests --- */}
            {step === 3 && (
              <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Personality, interests & socials</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Current mood</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {moodOptions.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => handleFieldChange("mood", m.id)}
                          className={`p-2 rounded-xl border ${draft.mood === m.id ? "ring-2 ring-indigo-200 bg-indigo-50" : "bg-white"}`}
                          title={m.label}
                        >
                          <div className="text-xl">{m.emoji}</div>
                        </button>
                      ))}
                    </div>
                    <div className="text-sm text-gray-500 mt-2">Selected: {moodOptions.find((o) => o.id === draft.mood)?.label ?? "—"}</div>
                  </div>

                  <div>
                    <Label>Communication style</Label>
                    <select value={draft.communicationStyle ?? ""} onChange={(e) => handleFieldChange("communicationStyle", e.target.value)} className="w-full border rounded-lg p-2">
                      <option value="">Select</option>
                      <option value="calm">Calm</option>
                      <option value="energetic">Energetic</option>
                      <option value="formal">Formal</option>
                      <option value="casual">Casual</option>
                      <option value="empathetic">Empathetic</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <Label>Interests / Hobbies</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={interestInput}
                        onChange={(e) => setInterestInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addInterest();
                          }
                        }}
                        placeholder="Type and press Enter"
                      />
                      <Button onClick={addInterest}>Add</Button>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {(draft.interests || []).map((t: string) => (
                        <div key={t} className="px-3 py-1 rounded-full bg-indigo-50 text-sm inline-flex items-center gap-2">
                          <span>{t}</span>
                          <button onClick={() => removeInterest(t)} className="text-xs">✕</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Weekend activity preference</Label>
                    <select value={draft.weekendPref ?? ""} onChange={(e) => handleFieldChange("weekendPref", e.target.value)} className="w-full border rounded-lg p-2">
                      <option value="">Select</option>
                      <option value="relaxing">Relaxing</option>
                      <option value="socializing">Socializing</option>
                      <option value="exploring">Exploring</option>
                      <option value="working">Working</option>
                      <option value="studying">Studying</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between mt-6 items-center">
                  <div className="text-sm text-gray-500">
                    {saving ? (
                      <span className="inline-flex items-center gap-2"><Loader2 className="animate-spin" /> Saving draft...</span>
                    ) : (
                      <span>Draft {draft.updatedAt ? `saved · ${new Date(draft.updatedAt).toLocaleString()}` : "(auto-save)"}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                    <div className="flex gap-2">
                      <Button onClick={() => setStep(4)} className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={loading}>
                        Continue to Socials
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.section>
            )}

            {/* --- STEP 4: Social Connections --- */}
            {step === 4 && (
              <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Connect social media (connect at least one)</h3>

                <p className="text-xs text-gray-500 mb-4">Connecting allows deeper analysis and activity insights. You can connect more later.</p>

                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" disabled={loading || connected.twitter} onClick={() => startOauthFlow("twitter")}>
                    <Twitter className="mr-2 text-sky-500" />
                    {connected.twitter ? "Twitter Connected" : "Connect Twitter"}
                  </Button>

                  <Button variant="outline" disabled={loading || connected.spotify} onClick={() => startOauthFlow("spotify")}>
                    <Music className="mr-2 text-green-500" />
                    {connected.spotify ? "Spotify Connected" : "Connect Spotify"}
                  </Button>

                  <Button variant="outline" disabled={loading || connected.reddit} onClick={() => startOauthFlow("reddit")}>
                    <MessageSquare className="mr-2 text-orange-500" />
                    {connected.reddit ? "Reddit Connected" : "Connect Reddit"}
                  </Button>
                </div>

                <div className="mt-6">
                  <Label>Connected providers</Label>
                  <div className="mt-2 flex gap-3 items-center">
                    {connected.twitter ? (
                      <div className="px-3 py-1 bg-indigo-50 rounded inline-flex items-center gap-2">
                        <Twitter /> Twitter
                        <button onClick={() => handleDisconnect("twitter")} className="ml-2 text-xs">Disconnect</button>
                      </div>
                    ) : (
                      <div className="px-3 py-1 bg-gray-50 rounded text-sm">Twitter not connected</div>
                    )}

                    {connected.reddit ? (
                      <div className="px-3 py-1 bg-indigo-50 rounded inline-flex items-center gap-2">
                        <MessageSquare /> Reddit
                        <button onClick={() => handleDisconnect("reddit")} className="ml-2 text-xs">Disconnect</button>
                      </div>
                    ) : (
                      <div className="px-3 py-1 bg-gray-50 rounded text-sm">Reddit not connected</div>
                    )}

                    {connected.spotify ? (
                      <div className="px-3 py-1 bg-indigo-50 rounded inline-flex items-center gap-2">
                        <Music /> Spotify
                        <button onClick={() => handleDisconnect("spotify")} className="ml-2 text-xs">Disconnect</button>
                      </div>
                    ) : (
                      <div className="px-3 py-1 bg-gray-50 rounded text-sm">Spotify not connected</div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between mt-6 items-center">
                  <div className="text-sm text-gray-500">
                    {saving ? (
                      <span className="inline-flex items-center gap-2"><Loader2 className="animate-spin" /> Saving draft...</span>
                    ) : (
                      <span>Draft {draft.updatedAt ? `saved · ${new Date(draft.updatedAt).toLocaleString()}` : "(auto-save)"}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
                    <Button onClick={handleSaveAndContinue} className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={loading}>
                      {loading ? <><Loader2 className="mr-2 animate-spin" /> Saving...</> : 'Save & Continue'}
                    </Button>
                  </div>
                </div>
              </motion.section>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ----- OAuth confirm modal ----- */}
      {oauthConfirm.open && oauthConfirm.provider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <div className="flex justify-between items-start">
              <h4 className="text-lg font-semibold">Connect {oauthConfirm.provider}</h4>
              <button onClick={() => setOauthConfirm({ provider: null, open: false })}><X /></button>
            </div>
            <p className="mt-3 text-sm text-gray-600">
              We saved your profile. You will now be redirected to {oauthConfirm.provider} to connect the account.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setOauthConfirm({ provider: null, open: false })}>Cancel</Button>
              <Button onClick={confirmOauthRedirect} className="bg-indigo-600 hover:bg-indigo-700 text-white">Continue</Button>
            </div>
          </div>
        </div>
      )}

      {/* ----- Post-OAuth Modal (toast + modal per your choice A) ----- */}
      {postOauthModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <div className="flex justify-between items-start">
              <h4 className="text-lg font-semibold">Connected</h4>
              <button onClick={() => setPostOauthModal({ provider: null, open: false })}><X /></button>
            </div>
            <p className="mt-3 text-sm text-gray-700">
              {postOauthModal.provider} connected successfully. Do you want to connect more accounts or go to the dashboard?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => postOauthChoice("more")}>Connect more</Button>
              <Button onClick={() => postOauthChoice("dashboard")} className="bg-indigo-600 hover:bg-indigo-700 text-white">Go to Dashboard</Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
