"use client"
import { motion } from "framer-motion"
import { Brain, Smile, Frown, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import Navbar from "@/components/Navbar"

const moodData = [
  { day: "Mon", mood: 70 },
  { day: "Tue", mood: 65 },
  { day: "Wed", mood: 80 },
  { day: "Thu", mood: 75 },
  { day: "Fri", mood: 60 },
  { day: "Sat", mood: 85 },
  { day: "Sun", mood: 78 },
]

export default function Dashboard() {
  return (
    <nav>
      <Navbar/>
    
    <main className="min-h-screen bg-gradient-to-b from-white to-calm px-6 md:px-16 py-12">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex justify-between items-center mb-10"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, Aditya 👋</h1>
          <p className="text-gray-500">Here’s your mental wellness summary for this week.</p>
        </div>
        <Button variant="outline" className="text-sm">Export Report</Button>
      </motion.div>

      {/* Insight Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid md:grid-cols-4 gap-6 mb-12"
      >
        <Card className="shadow-sm hover:shadow-md transition">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Smile /> Positivity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">82%</p>
            <p className="text-sm text-gray-500">↑ 5% since last week</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <Brain /> Focus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">74%</p>
            <p className="text-sm text-gray-500">↔ Stable trend</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Frown /> Stress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">61%</p>
            <p className="text-sm text-gray-500">↓ 3% this week</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <AlertTriangle /> Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">2</p>
            <p className="text-sm text-gray-500">Potential stress patterns</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Emotion Trend Chart */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-sm p-8 mb-12"
      >
        <h2 className="text-xl font-semibold mb-6 text-gray-800">Weekly Mood Trends</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={moodData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis domain={[50, 100]} />
            <Tooltip />
            <Line type="monotone" dataKey="mood" stroke="#7c3aed" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Alerts + Recommendations */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="grid md:grid-cols-2 gap-8"
      >
        <Card className="bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center gap-2">
              <AlertTriangle /> Alerts & Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Increased late-night social activity this week.</li>
              <li>Detected negative tone in 3 recent posts.</li>
              <li>Consider taking short digital breaks during the day.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-700">Mindful Recommendations 🌿</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-gray-700">
            <p>✨ Try a 10-minute breathing exercise before bed.</p>
            <p>🎧 Listen to relaxing music while working.</p>
            <p>📓 Write one positive thing about your day tonight.</p>
          </CardContent>
        </Card>
      </motion.div>
    </main>
    </nav>
  )
}
