"use client"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Hero() {
  return (
    <section className="flex flex-col md:flex-row items-center justify-between px-12 py-24 bg-gradient-to-r from-calm via-white to-calm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-xl space-y-6"
      >
        <h1 className="text-5xl font-bold leading-tight text-gray-900">
          Understand your <span className="text-primary">mind</span> through your digital footprint.
        </h1>
        <p className="text-gray-600 text-lg">
          NeuraSense analyzes your social media behavior to help you detect early signs of
          stress, anxiety, and depression — so you can take control before it’s too late.
        </p>
        <div className="flex gap-4">
          <Link href="/sign-in"><Button size="lg">Try Now</Button></Link>
          <a href="#how">
            <Button variant="outline" size="lg">Learn How</Button>
          </a>
        </div>
      </motion.div>

      <motion.img
        src="/Innovation.gif"
        alt="Mental Health Illustration"
        className="w-[500px] mt-10 md:mt-0"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
      />
    </section>
  )
}
