"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Menu, LogOut, User, LayoutDashboard } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // Track Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex justify-between items-center px-8 py-3 bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-200"
    >
      {/* Logo */}
      <h1
        onClick={() => router.push("/")}
        className="text-2xl font-bold text-primary cursor-pointer"
      >
        NeuraSense 🧠
      </h1>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-6">
        {user ? (
          <>
            <Button
              variant="ghost"
              className="flex items-center gap-2"
              onClick={() => router.push("/dashboard")}
            >
              <LayoutDashboard size={18} /> Dashboard
            </Button>
            <Button
              variant="ghost"
              className="flex items-center gap-2"
              onClick={() => router.push("/profile-setup")}
            >
              <User size={18} /> Profile
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut size={18} /> Logout
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={() => router.push("/login")}
            >
              Login
            </Button>
            <Button
              onClick={() => router.push("/signup")}
              className="bg-primary text-white hover:bg-primary/90"
            >
              Get Started
            </Button>
          </>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 rounded-md hover:bg-gray-100"
      >
        <Menu size={22} />
      </button>

      {/* Mobile Dropdown */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-16 right-6 bg-white shadow-md rounded-lg p-4 flex flex-col gap-3 w-48 border border-gray-200 md:hidden"
        >
          {user ? (
            <>
              <Button
                variant="ghost"
                onClick={() => {
                  router.push("/dashboard");
                  setIsOpen(false);
                }}
              >
                Dashboard
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  router.push("/profile-setup");
                  setIsOpen(false);
                }}
              >
                Profile
              </Button>
              <Button
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  router.push("/login");
                  setIsOpen(false);
                }}
              >
                Login
              </Button>
              <Button
                onClick={() => {
                  router.push("/signup");
                  setIsOpen(false);
                }}
              >
                Get Started
              </Button>
            </>
          )}
        </motion.div>
      )}
    </motion.nav>
  );
}
