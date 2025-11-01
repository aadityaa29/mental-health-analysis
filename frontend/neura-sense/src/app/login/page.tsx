"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { auth, db } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Loader2, Mail, Lock, Chrome } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const provider = new GoogleAuthProvider();

  // 🔹 Login with Email/Password
  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const user = userCred.user;
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        router.push("/dashboard");
      } else {
        router.push("/profile-setup");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Login with Google
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const userCred = await signInWithPopup(auth, provider);
      const user = userCred.user;
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        router.push("/dashboard");
      } else {
        await setDoc(userRef, {
          email: user.email,
          name: user.displayName,
          createdAt: new Date(),
        });
        router.push("/profile-setup");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-blue-100 px-6">
      {/* glowing floating gradients */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-300/30 blur-3xl rounded-full animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400/20 blur-3xl rounded-full animate-pulse delay-1000" />
      <div className="absolute -bottom-20 left-20 w-72 h-72 bg-purple-300/20 blur-3xl rounded-full animate-pulse delay-700" />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl p-8"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
            Welcome Back 👋
          </h2>
          <p className="text-gray-500 text-sm mt-2">
            Sign in to continue your journey
          </p>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm text-center mb-4 bg-red-50 border border-red-100 rounded-md p-2"
          >
            {error}
          </motion.p>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email
            </label>
            <div className="flex items-center border border-gray-300 focus-within:border-indigo-500 rounded-lg px-3 py-2 transition-all bg-white/60">
              <Mail className="text-gray-400 mr-2 w-4 h-4" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="border-none focus:ring-0 bg-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Password
            </label>
            <div className="flex items-center border border-gray-300 focus-within:border-indigo-500 rounded-lg px-3 py-2 transition-all bg-white/60">
              <Lock className="text-gray-400 mr-2 w-4 h-4" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="border-none focus:ring-0 bg-transparent"
              />
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <Button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-semibold py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 animate-spin" /> Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </motion.div>

          <div className="flex items-center justify-center my-4">
            <div className="h-px w-1/3 bg-gray-300" />
            <span className="text-gray-400 text-sm mx-2">OR</span>
            <div className="h-px w-1/3 bg-gray-300" />
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <Button
              onClick={handleGoogleLogin}
              variant="outline"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 font-medium border-gray-300 hover:bg-gray-50"
            >
              <Chrome className="w-5 h-5 text-blue-600" />
              Continue with Google
            </Button>
          </motion.div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Don’t have an account?{" "}
          <a
            href="/signup"
            className="text-indigo-600 font-medium hover:underline"
          >
            Sign up
          </a>
        </p>
      </motion.div>
    </main>
  );
}
