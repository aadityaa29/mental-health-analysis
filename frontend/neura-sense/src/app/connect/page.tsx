"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Twitter, MessageSquare, Music, X, Check } from "lucide-react";

import { auth, db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

type ConnectedAccounts = {
  twitter: boolean;
  reddit: boolean;
  spotify: boolean;
};

export default function ConnectPage() {
  const search = useSearchParams();
  const router = useRouter();
  const oauthProvider = search?.get("oauth") ?? null;

  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const [connected, setConnected] = useState<ConnectedAccounts>({
    twitter: false,
    reddit: false,
    spotify: false,
  });

  // OAuth modals
  const [oauthConfirm, setOauthConfirm] = useState<{
    provider: "reddit" | "spotify" | "twitter" | null;
    open: boolean;
  }>({ provider: null, open: false });

  const [postOauthModal, setPostOauthModal] = useState<{
    provider: string | null;
    open: boolean;
  }>({ provider: null, open: false });

  /* -----------------------------
     Load User + Connected Tokens
     -----------------------------*/
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.push("/login");
        return;
      }
      setUser(u);
      await refreshConnections(u.uid);
    });
    return () => unsub();
  }, [router]);

  async function refreshConnections(uid: string) {
    const snap = await getDocs(collection(db, "users", uid, "tokens"));

    const present: ConnectedAccounts = {
      twitter: false,
      reddit: false,
      spotify: false,
    };

    snap.forEach((d) => {
      const id = d.id.toLowerCase();
      if (id.includes("reddit")) present.reddit = true;
      if (id.includes("twitter")) present.twitter = true;
      if (id.includes("spotify")) present.spotify = true;
    });

    setConnected(present);
  }

  /* -----------------------------
     Connect Handler
     -----------------------------*/
  const startOauthFlow = async (provider: "reddit" | "spotify" | "twitter") => {
    setOauthConfirm({ provider, open: true });
  };

  const confirmOauthRedirect = async () => {
    if (!user || !oauthConfirm.provider) return;

    const provider = oauthConfirm.provider;
    setOauthConfirm({ provider: null, open: false });

    try {
      setLoading(true);
      const currentUser = getAuth().currentUser;
      if (!currentUser) throw new Error("Not authenticated");

      const token = await currentUser.getIdToken();

      if (provider === "reddit") {
        window.location.href = `/api/auth/reddit?token=${token}`;
      } else if (provider === "spotify") {
        window.location.href = `/api/auth/spotify?token=${token}`;
      } else if (provider === "twitter") {
        window.location.href = `/api/connect/twitter?uid=${currentUser.uid}`;
      }
    } catch (err) {
      console.error(err);
      toast.error("OAuth failed.");
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
     Post-OAuth Handling
     -----------------------------*/
  useEffect(() => {
    if (!user || !oauthProvider) return;

    (async () => {
      await refreshConnections(user.uid);
      toast.success(`${oauthProvider} connected!`);
      setPostOauthModal({ provider: oauthProvider, open: true });
    })();
  }, [oauthProvider, user]);

  const postOauthChoice = (choice: "dashboard" | "stay") => {
    setPostOauthModal({ provider: null, open: false });
    if (choice === "dashboard") {
      router.push("/dashboard");
    }
  };

  /* -----------------------------
     Disconnect
     -----------------------------*/
  const handleDisconnect = async (providerKey: string) => {
    if (!user) return;

    try {
      await deleteDoc(doc(db, "users", user.uid, "tokens", providerKey));
      await refreshConnections(user.uid);
      toast.success(`${providerKey} disconnected`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to disconnect");
    }
  };

  /* -----------------------------
     Render
     -----------------------------*/
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-b from-indigo-50 to-white">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl">
        <Card className="rounded-2xl shadow-md border border-indigo-100">
          <CardContent className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">Connect Your Accounts 🔗</h1>
            <p className="text-gray-600 text-center mb-6">
              Connect at least one social platform to unlock deeper insights.
            </p>

            {/* CONNECTION BUTTONS */}
            <div className="flex flex-col gap-3 mb-8">
              <Button
                variant="outline"
                disabled={connected.twitter}
                onClick={() => startOauthFlow("twitter")}
              >
                <Twitter className="mr-2 text-sky-500" />
                {connected.twitter ? "Twitter Connected" : "Connect Twitter"}
              </Button>

              <Button
                variant="outline"
                disabled={connected.spotify}
                onClick={() => startOauthFlow("spotify")}
              >
                <Music className="mr-2 text-green-500" />
                {connected.spotify ? "Spotify Connected" : "Connect Spotify"}
              </Button>

              <Button
                variant="outline"
                disabled={connected.reddit}
                onClick={() => startOauthFlow("reddit")}
              >
                <MessageSquare className="mr-2 text-orange-500" />
                {connected.reddit ? "Reddit Connected" : "Connect Reddit"}
              </Button>
            </div>

            {/* CONNECTED BADGES */}
            <h3 className="font-semibold text-gray-800 mb-2">Connected</h3>
            <div className="flex flex-wrap gap-2 text-sm">
              {connected.twitter ? (
                <div className="px-3 py-1 bg-indigo-50 rounded-xl inline-flex items-center gap-2">
                  <Twitter /> Twitter
                  <button onClick={() => handleDisconnect("twitter")} className="text-xs text-red-600">Disconnect</button>
                </div>
              ) : (
                <span className="px-3 py-1 bg-gray-50 rounded-xl">Twitter — Not Connected</span>
              )}

              {connected.reddit ? (
                <div className="px-3 py-1 bg-indigo-50 rounded-xl inline-flex items-center gap-2">
                  <MessageSquare /> Reddit
                  <button onClick={() => handleDisconnect("reddit")} className="text-xs text-red-600">Disconnect</button>
                </div>
              ) : (
                <span className="px-3 py-1 bg-gray-50 rounded-xl">Reddit — Not Connected</span>
              )}

              {connected.spotify ? (
                <div className="px-3 py-1 bg-indigo-50 rounded-xl inline-flex items-center gap-2">
                  <Music /> Spotify
                  <button onClick={() => handleDisconnect("spotify")} className="text-xs text-red-600">Disconnect</button>
                </div>
              ) : (
                <span className="px-3 py-1 bg-gray-50 rounded-xl">Spotify — Not Connected</span>
              )}
            </div>

            <div className="mt-10 flex justify-center">
              <Button
                onClick={() => router.push("/dashboard")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8"
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* CONFIRM MODAL */}
      {oauthConfirm.open && oauthConfirm.provider && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <div className="flex justify-between">
              <h2 className="text-lg font-semibold">Connect {oauthConfirm.provider}</h2>
              <button onClick={() => setOauthConfirm({ open: false, provider: null })}>
                <X />
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              You will be redirected to {oauthConfirm.provider} to authorize this connection.
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOauthConfirm({ open: false, provider: null })}>Cancel</Button>
              <Button onClick={confirmOauthRedirect} className="bg-indigo-600 text-white">
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* POST-OAUTH MODAL */}
      {postOauthModal.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <div className="flex justify-between">
              <h2 className="text-lg font-semibold"><Check className="text-green-600 inline-block mr-1" /> Connected!</h2>
              <button onClick={() => setPostOauthModal({ open: false, provider: null })}>
                <X />
              </button>
            </div>

            <p className="mt-2 text-sm text-gray-700">
              {postOauthModal.provider} was successfully connected.
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => postOauthChoice("stay")}>Stay Here</Button>
              <Button className="bg-indigo-600 text-white" onClick={() => postOauthChoice("dashboard")}>Go to Dashboard</Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
