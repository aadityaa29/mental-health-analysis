"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function TestFirestorePage() {
  const [status, setStatus] = useState("Waiting...");
  const [userId, setUserId] = useState("");

  const runTest = async () => {
    setStatus("Checking Auth...");

    let uid: string | null = null;

    const p = new Promise<void>((resolve) => {
      onAuthStateChanged(auth, async (user) => {
        if (!user) {
          setStatus("❌ Not signed in");
          resolve();
          return;
        }
        uid = user.uid;
        setUserId(uid);
        resolve();
      });
    });

    await p;

    if (!uid) return;

    setStatus("Trying Firestore write...");

    try {
      await setDoc(
        doc(db, "profiles", uid, "draft", "info"),
        { testWrite: "SUCCESS", timestamp: new Date() },
        { merge: true }
      );

      setStatus("✅ Firestore WRITE SUCCESS! Draft saved correctly.");
    } catch (err: any) {
      console.error(err);
      setStatus("❌ Firestore WRITE FAILED: " + err.message);
    }
  };

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Firebase Firestore Test</h1>

      <button
        onClick={runTest}
        className="px-4 py-2 bg-indigo-600 text-white rounded"
      >
        Run Test
      </button>

      <div className="mt-4 p-3 border rounded bg-gray-50">
        <p><strong>Status:</strong> {status}</p>
        <p><strong>User ID:</strong> {userId || "—"}</p>
      </div>
    </main>
  );
}
