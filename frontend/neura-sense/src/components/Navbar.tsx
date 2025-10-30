"use client"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs"

export default function Navbar() {
  return (
    <motion.nav
      className="flex justify-between items-center px-8 py-4 bg-white shadow-sm sticky top-0 z-50"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <h1 className="text-2xl font-bold text-primary">NeuraSense 🧠</h1>
      <div className="flex items-center gap-4">
        <a href="#how" className="hover:text-primary">How it Works</a>
        <a href="#accuracy" className="hover:text-primary">Accuracy</a>
        <a href="#contact" className="hover:text-primary">Contact</a>
        <a href="/profile-setup" className="hover:text-primary">Profile Setup</a>
        <a href="/dashboard" className="hover:text-primary">Dashboard</a>
        <a href="/explore" className="hover:text-primary">Explore</a>



        <SignedOut>
          <SignInButton mode="modal">
            <Button variant="outline">Login</Button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    </motion.nav>
  )
}
