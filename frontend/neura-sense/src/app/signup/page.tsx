"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCred.user, { displayName: name });

      await setDoc(doc(db, "users", userCred.user.uid), {
        uid: userCred.user.uid,
        name,
        email,
        createdAt: serverTimestamp(),
        onboardingComplete: false,
      });

      router.push("/profile-setup");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 relative overflow-hidden">
      {/* floating gradient lights */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-blue-300/30 blur-3xl rounded-full animate-pulse" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-400/20 blur-3xl rounded-full animate-pulse delay-1000" />

      <motion.form
        onSubmit={handleSignup}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-[95%] max-w-md p-8 bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl shadow-xl space-y-5"
      >
        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
          Create Account
        </h2>

        {error && (
          <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-md border border-red-100">
            {error}
          </p>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-2.5 rounded-md outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-2.5 rounded-md outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-2.5 rounded-md outline-none transition-all"
              required
            />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          className="bg-gradient-to-r from-blue-600 to-indigo-500 text-white w-full py-2.5 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
        >
          Sign Up
        </motion.button>

        <p className="text-sm text-center text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 font-medium hover:underline">
            Log In
          </a>
        </p>
      </motion.form>
    </main>
  );
}
