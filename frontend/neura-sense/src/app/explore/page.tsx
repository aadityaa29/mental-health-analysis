"use client"
import { motion } from "framer-motion"
import { Music, BookOpen, Coffee, Sun, Heart, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/Navbar"

export default function Explore() {
  const activities = [
    {
      icon: <Music className="text-indigo-600" />,
      title: "Calming Music",
      desc: "Listen to AI-curated playlists that relax your mind and improve focus.",
      action: "Play Now",
    },
    {
      icon: <BookOpen className="text-teal-600" />,
      title: "Mindfulness Reads",
      desc: "Short, science-backed reads to boost emotional balance.",
      action: "Read Article",
    },
    {
      icon: <Coffee className="text-amber-600" />,
      title: "5-Minute Breathing",
      desc: "A guided breathing exercise to help you reset and recharge.",
      action: "Start Exercise",
    },
    {
      icon: <Sun className="text-yellow-500" />,
      title: "Daily Gratitude",
      desc: "Write one thing you’re grateful for and share positivity.",
      action: "Write Now",
    },
  ]

  const quotes = [
    "“Peace comes from within. Do not seek it without.” – Buddha",
    "“You, yourself, as much as anybody in the entire universe, deserve your love and affection.”",
    "“Sometimes the most productive thing you can do is relax.”",
  ]

  return (
    <nav>
      {/* <Navbar/> */}
    
    <main className="min-h-screen bg-gradient-to-b from-white to-indigo-50 px-6 md:px-16 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Explore Wellness 🌿</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Take a mindful pause — explore calming activities, motivational reads, and AI-powered
          wellness challenges personalized for you.
        </p>
      </motion.div>

      {/* Activities Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
      >
        {activities.map((item, i) => (
          <Card
            key={i}
            className="shadow-sm hover:shadow-md transition bg-white border border-indigo-100 rounded-2xl"
          >
            <CardHeader className="flex flex-col items-center justify-center gap-3">
              <div className="p-3 bg-indigo-50 rounded-full">{item.icon}</div>
              <CardTitle className="text-lg font-semibold text-gray-800 text-center">
                {item.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center text-gray-600">
              <p className="mb-4">{item.desc}</p>
              <Button variant="outline" size="sm">
                {item.action}
              </Button>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Daily Quote Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-10 rounded-3xl shadow-md text-center mb-16"
      >
        <Heart className="mx-auto mb-4" size={36} />
        <h2 className="text-2xl font-semibold mb-4">Today’s Mindful Quote</h2>
        <p className="text-lg italic max-w-2xl mx-auto">
          {quotes[Math.floor(Math.random() * quotes.length)]}
        </p>
      </motion.div>

      {/* AI Challenge Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 text-center"
      >
        <Sparkles className="mx-auto mb-4 text-yellow-500" size={32} />
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">AI Wellness Challenge</h2>
        <p className="text-gray-600 mb-6">
          Based on your recent emotional trends, your AI buddy suggests:
          <br />
          <strong>“Take a digital detox for 1 hour today and go for a short walk.”</strong>
        </p>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">Accept Challenge</Button>
      </motion.div>
    </main>
    </nav>
  )
}
