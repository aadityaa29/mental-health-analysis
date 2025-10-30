"use client"
import { motion } from "framer-motion"
import { Brain, Share2, LineChart } from "lucide-react"

const steps = [
  {
    icon: Share2,
    title: "Connect Your Social Media",
    description:
      "Securely link your Instagram, Reddit, or Twitter account to help us understand your digital footprint. Your data stays private and safe.",
  },
  {
    icon: Brain,
    title: "AI Analyzes Your Behavior",
    description:
      "Our AI model studies your posts, comments, and engagement patterns to detect subtle emotional signals.",
  },
  {
    icon: LineChart,
    title: "Get Insights & Alerts",
    description:
      "Receive friendly insights about your mental well-being and personalized recommendations to maintain a healthy balance.",
  },
]

export default function HowItWorks() {
  return (
    <section id="how" className="py-24 bg-white px-8 md:px-16 text-center">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-bold text-gray-900 mb-12"
      >
        How <span className="text-primary">NeuraSense</span> Works
      </motion.h2>

      <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
        {steps.map((step, index) => {
          const Icon = step.icon
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="bg-calm rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-center mb-4">
                <div className="bg-primary/10 p-4 rounded-full">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
