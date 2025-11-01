"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Button,
} from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Github,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Loader2,
  Check,
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function ProfileSetupPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Basic
  const [name, setName] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [gender, setGender] = useState("");
  const [city, setCity] = useState("");
  const [occupation, setOccupation] = useState("");
  const [preferredTheme, setPreferredTheme] = useState("system");
  const [studyPattern, setStudyPattern] = useState("");

  // Lifestyle
  const [sleepHours, setSleepHours] = useState<number | "">("");
  const [exerciseFreq, setExerciseFreq] = useState("");
  const [screenTime, setScreenTime] = useState<number | "">("");
  const [stressLevel, setStressLevel] = useState<number>(5);
  const [waterIntake, setWaterIntake] = useState<number | "">("");
  const [smokingDrinking, setSmokingDrinking] = useState("");
  const [wakeUpTime, setWakeUpTime] = useState("");
  const [bedTime, setBedTime] = useState("");

  // Personality & Interests
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
  const [mood, setMood] = useState<number>(6);
  const [communicationStyle, setCommunicationStyle] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState("");
  const [weekendPref, setWeekendPref] = useState("");

  // Socials / presence
  const [connected, setConnected] = useState<{ [k: string]: boolean }>({
    twitter: false,
    instagram: false,
    linkedin: false,
    github: false,
    youtube: false,
    website: false,
    discord: false,
    reddit: false,
  });

  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [discordHandle, setDiscordHandle] = useState("");
  const [redditHandle, setRedditHandle] = useState("");

  // Step / progress
  const [step, setStep] = useState(1);

  // Check auth + redirect if profile exists omitted for brevity (keep similar to your original flow)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }
      setUser(currentUser);
    });
    return () => unsub();
  }, [router]);

  // interests helpers
  const addInterest = (tag?: string) => {
    const val = (tag ?? interestInput).trim();
    if (!val) return;
    if (!interests.includes(val)) setInterests((p) => [...p, val]);
    setInterestInput("");
  };
  const removeInterest = (tag: string) => {
    setInterests((p) => p.filter((t) => t !== tag));
  };

  // mock connect handler (replace with OAuth flows later)
  const handleConnect = (platform: string) => {
    setLoading(true);
    setTimeout(() => {
      setConnected((p) => ({ ...p, [platform]: true }));
      // also set some sample url if available
      if (platform === "linkedin") setLinkedInUrl("https://linkedin.com/in/username");
      if (platform === "github") setGithubUrl("https://github.com/username");
      setLoading(false);
      toast.success(`${platform[0].toUpperCase() + platform.slice(1)} connected`);
    }, 700);
  };

  const atLeastOneConnected = Object.values(connected).some((v) => v === true);

  const handleSave = async () => {
    if (!user) return;
    if (!atLeastOneConnected) {
      toast.error("Please connect at least one social account for analysis.");
      return;
    }

    setLoading(true);
    try {
      // prepare payload with defaults for optional fields
      const profileData: any = {
        name: name || "Not provided",
        age: age === "" ? null : Number(age),
        gender: gender || "Not provided",
        city: city || "Not provided",
        occupation: occupation || "Not provided",
        preferredTheme: preferredTheme || "system",
        studyPattern: studyPattern || "Not provided",

        sleepHours: sleepHours === "" ? null : Number(sleepHours),
        exerciseFreq: exerciseFreq || "Not provided",
        screenTime: screenTime === "" ? null : Number(screenTime),
        stressLevel: stressLevel || 5,
        waterIntake: waterIntake === "" ? null : Number(waterIntake),
        smokingDrinking: smokingDrinking || "Not provided",
        wakeUpTime: wakeUpTime || "Not provided",
        bedTime: bedTime || "Not provided",

        mood,
        communicationStyle: communicationStyle || "Not provided",
        interests: interests.length ? interests : ["Not provided"],
        weekendPref: weekendPref || "Not provided",

        connectedAccounts: connected,
        socialProfiles: {
          linkedin: linkedInUrl || "Not provided",
          github: githubUrl || "Not provided",
          website: websiteUrl || "Not provided",
          youtube: youtubeUrl || "Not provided",
          discord: discordHandle || "Not provided",
          reddit: redditHandle || "Not provided",
        },

        createdAt: new Date(),
      };

      await setDoc(doc(db, "profiles", user.uid), profileData);
      toast.success("Profile saved. Redirecting to dashboard...");
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save profile. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-start justify-center py-12 px-4 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
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
                  <div className="px-3 py-1 rounded-full text-sm bg-indigo-600 text-white">{step}/3</div>
                  <div className="text-xs text-gray-500">Progress</div>
                </div>
              </div>
            </div>
          </div>

          <CardContent className="p-6">
            {/* Step content toggling */}
            {step === 1 && (
              <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
                  </div>

                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input id="age" type="number" value={age} onChange={(e) => setAge(e.target.value === "" ? "" : Number(e.target.value))} placeholder="e.g. 20" />
                  </div>

                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)} className="w-full border rounded-lg p-2">
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not">Prefer not to say</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="city">Location / City</Label>
                    <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
                  </div>

                  <div>
                    <Label htmlFor="occupation">Occupation / Profession</Label>
                    <Input id="occupation" value={occupation} onChange={(e) => setOccupation(e.target.value)} placeholder="e.g. Student / Developer" />
                  </div>

                  <div>
                    <Label htmlFor="studyPattern">Study Routine Pattern</Label>
                    <select id="studyPattern" value={studyPattern} onChange={(e) => setStudyPattern(e.target.value)} className="w-full border rounded-lg p-2">
                      <option value="">Select</option>
                      <option value="morning">Morning</option>
                      <option value="night">Night</option>
                      <option value="flexible">Flexible</option>
                    </select>
                  </div>

                  <div>
                    <Label>Preferred Theme</Label>
                    <div className="flex gap-2 mt-1">
                      <label className={`px-3 py-1 rounded-lg border ${preferredTheme === 'light' ? 'bg-white ring-2 ring-indigo-200' : 'bg-transparent'}`}>
                        <input type="radio" name="theme" value="light" checked={preferredTheme === 'light'} onChange={() => setPreferredTheme('light')} className="hidden" /> Light
                      </label>
                      <label className={`px-3 py-1 rounded-lg border ${preferredTheme === 'dark' ? 'bg-black text-white ring-2 ring-indigo-200' : 'bg-transparent'}`}>
                        <input type="radio" name="theme" value="dark" checked={preferredTheme === 'dark'} onChange={() => setPreferredTheme('dark')} className="hidden" /> Dark
                      </label>
                      <label className={`px-3 py-1 rounded-lg border ${preferredTheme === 'system' ? 'bg-indigo-50 ring-2 ring-indigo-200' : 'bg-transparent'}`}>
                        <input type="radio" name="theme" value="system" checked={preferredTheme === 'system'} onChange={() => setPreferredTheme('system')} className="hidden" /> System
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <div />
                  <Button onClick={() => setStep(2)} className="bg-indigo-600 hover:bg-indigo-700 text-white">Next</Button>
                </div>
              </motion.section>
            )}

            {step === 2 && (
              <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Health & daily habits</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Average sleep (hrs)</Label>
                    <Input value={sleepHours} onChange={(e) => setSleepHours(e.target.value === "" ? "" : Number(e.target.value))} placeholder="e.g. 7" />
                  </div>

                  <div>
                    <Label>Exercise frequency</Label>
                    <select value={exerciseFreq} onChange={(e) => setExerciseFreq(e.target.value)} className="w-full border rounded-lg p-2">
                      <option value="">Select</option>
                      <option value="daily">Daily</option>
                      <option value="3-4">3-4 times/week</option>
                      <option value="occasionally">Occasionally</option>
                      <option value="never">Never</option>
                    </select>
                  </div>

                  <div>
                    <Label>Average screen time (hrs/day)</Label>
                    <Input value={screenTime} onChange={(e) => setScreenTime(e.target.value === "" ? "" : Number(e.target.value))} placeholder="e.g. 6" />
                  </div>

                  <div>
                    <Label>Stress level</Label>
                    <div className="mt-2 flex items-center gap-3">
                      <input type="range" min={1} max={10} value={stressLevel} onChange={(e) => setStressLevel(Number(e.target.value))} className="w-full" />
                      <div className="w-12 text-sm text-gray-700">{stressLevel}</div>
                    </div>
                  </div>

                  <div>
                    <Label>Water intake (liters/day)</Label>
                    <Input value={waterIntake} onChange={(e) => setWaterIntake(e.target.value === "" ? "" : Number(e.target.value))} placeholder="e.g. 2" />
                  </div>

                  <div>
                    <Label>Smoking / Drinking</Label>
                    <select value={smokingDrinking} onChange={(e) => setSmokingDrinking(e.target.value)} className="w-full border rounded-lg p-2">
                      <option value="">Select</option>
                      <option value="none">None</option>
                      <option value="occasionally">Occasionally</option>
                      <option value="regularly">Regularly</option>
                    </select>
                  </div>

                  <div>
                    <Label>Wake-up time</Label>
                    <Input type="time" value={wakeUpTime} onChange={(e) => setWakeUpTime(e.target.value)} />
                  </div>

                  <div>
                    <Label>Bedtime</Label>
                    <Input type="time" value={bedTime} onChange={(e) => setBedTime(e.target.value)} />
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button onClick={() => setStep(3)} className="bg-indigo-600 hover:bg-indigo-700 text-white">Next</Button>
                </div>
              </motion.section>
            )}

            {step === 3 && (
              <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Personality, interests & socials</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Current mood</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {moodOptions.map((m) => (
                        <button key={m.id} onClick={() => setMood(m.id)} className={`p-2 rounded-xl border ${mood === m.id ? 'ring-2 ring-indigo-200 bg-indigo-50' : 'bg-white'}`} title={m.label}>
                          <div className="text-xl">{m.emoji}</div>
                        </button>
                      ))}
                    </div>
                    <div className="text-sm text-gray-500 mt-2">Selected: {moodOptions.find(o => o.id === mood)?.label}</div>
                  </div>

                  <div>
                    <Label>Communication style</Label>
                    <select value={communicationStyle} onChange={(e) => setCommunicationStyle(e.target.value)} className="w-full border rounded-lg p-2">
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
                      <Input value={interestInput} onChange={(e) => setInterestInput(e.target.value)} placeholder="Type and press Enter" onKeyDown={(e) => {
                        if (e.key === 'Enter') { e.preventDefault(); addInterest(); }
                      }} />
                      <Button onClick={() => addInterest()} className="px-4">Add</Button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {interests.map((t) => (
                        <div key={t} className="px-3 py-1 rounded-full bg-indigo-50 text-sm inline-flex items-center gap-2">
                          <span>{t}</span>
                          <button onClick={() => removeInterest(t)} className="text-xs">✕</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Weekend activity preference</Label>
                    <select value={weekendPref} onChange={(e) => setWeekendPref(e.target.value)} className="w-full border rounded-lg p-2">
                      <option value="">Select</option>
                      <option value="relaxing">Relaxing</option>
                      <option value="socializing">Socializing</option>
                      <option value="exploring">Exploring</option>
                      <option value="working">Working</option>
                      <option value="studying">Studying</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <Label>Connect social media (connect at least one)</Label>
                    <p className="text-xs text-gray-500">Connecting allows deeper analysis and activity insights. You can connect more later.</p>
                    <div className="flex flex-wrap gap-3 mt-3">
                      <Button variant={connected.twitter ? 'secondary' : 'outline'} disabled={connected.twitter || loading} onClick={() => handleConnect('twitter')}>
                        <Twitter className="mr-2" /> {connected.twitter ? 'Connected' : 'Connect Twitter'} {connected.twitter && <Check className="ml-2" />}
                      </Button>

                      <Button variant={connected.instagram ? 'secondary' : 'outline'} disabled={connected.instagram || loading} onClick={() => handleConnect('instagram')}>
                        <Instagram className="mr-2" /> {connected.instagram ? 'Connected' : 'Connect Instagram'} {connected.instagram && <Check className="ml-2" />}
                      </Button>

                      <Button variant={connected.linkedin ? 'secondary' : 'outline'} disabled={connected.linkedin || loading} onClick={() => handleConnect('linkedin')}>
                        <Linkedin className="mr-2" /> {connected.linkedin ? 'Connected' : 'Connect LinkedIn'} {connected.linkedin && <Check className="ml-2" />}
                      </Button>

                      <Button variant={connected.github ? 'secondary' : 'outline'} disabled={connected.github || loading} onClick={() => handleConnect('github')}>
                        <Github className="mr-2" /> {connected.github ? 'Connected' : 'Connect GitHub'} {connected.github && <Check className="ml-2" />}
                      </Button>

                      <Button variant={connected.youtube ? 'secondary' : 'outline'} disabled={connected.youtube || loading} onClick={() => handleConnect('youtube')}>
                        <Youtube className="mr-2" /> {connected.youtube ? 'Connected' : 'Connect YouTube'} {connected.youtube && <Check className="ml-2" />}
                      </Button>
                    </div>

                    {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                      <div>
                        <Label>LinkedIn profile</Label>
                        <Input value={linkedInUrl} onChange={(e) => setLinkedInUrl(e.target.value)} placeholder="https://linkedin.com/in/username" />
                      </div>
                      <div>
                        <Label>GitHub profile</Label>
                        <Input value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/username" />
                      </div>

                      <div>
                        <Label>Personal website / portfolio</Label>
                        <Input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://your.site" />
                      </div>

                      <div>
                        <Label>YouTube channel (optional)</Label>
                        <Input value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/channel/..." />
                      </div>

                      <div>
                        <Label>Discord handle</Label>
                        <Input value={discordHandle} onChange={(e) => setDiscordHandle(e.target.value)} placeholder="username#1234" />
                      </div>

                      <div>
                        <Label>Reddit username</Label>
                        <Input value={redditHandle} onChange={(e) => setRedditHandle(e.target.value)} placeholder="u/username" />
                      </div>

                    </div> */}

                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-500">{atLeastOneConnected ? 'Ready to save' : 'Connect at least one social'}</div>
                    <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={loading || !atLeastOneConnected}>
                      {loading ? <><Loader2 className="mr-2 animate-spin" /> Saving...</> : 'Save & Continue'}
                    </Button>
                  </div>
                </div>

              </motion.section>
            )}

          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
