"use client"
import { motion, useSpring, useTransform } from "framer-motion"
import { Brain, Share2, LineChart } from "lucide-react"
import { useEffect, useState } from "react"

const steps = [
  {
    icon: Share2,
    title: "Connect Your Social Media",
    description:
      "Securely link your Instagram, Reddit, or Twitter accounts to allow our AI to understand your digital footprint. Your data is encrypted and always stays private.",
  },
  {
    icon: Brain,
    title: "AI Analyzes Your Behavior",
    description:
      "Our intelligent model studies your posts, tones, and emotional patterns using deep learning — finding early indicators of stress, anxiety, and mood trends.",
  },
  {
    icon: LineChart,
    title: "Get Insights & Alerts",
    description:
      "Receive calm, data-driven insights and proactive well-being alerts designed to help you maintain balance in your digital life.",
  },
]

export default function HowItWorks() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const [isClient, setIsClient] = useState(false)

  // Track mouse only on client
  useEffect(() => {
    setIsClient(true)
    const handleMouse = (e: MouseEvent) => setMouse({ x: e.clientX, y: e.clientY })
    window.addEventListener("mousemove", handleMouse)
    return () => window.removeEventListener("mousemove", handleMouse)
  }, [])

  // Animated tilt values
  const rotateX = useSpring(0, { stiffness: 80, damping: 12 })
  const rotateY = useSpring(0, { stiffness: 80, damping: 12 })

  useEffect(() => {
    if (!isClient) return
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2
    const tiltX = ((mouse.y - centerY) / centerY) * -8
    const tiltY = ((mouse.x - centerX) / centerX) * 8
    rotateX.set(tiltX)
    rotateY.set(tiltY)
  }, [mouse, isClient, rotateX, rotateY])

  return (
    <section
      id="how"
      className="relative py-28 bg-gradient-to-b from-white via-[#f3faff] to-[#eaf5ff] overflow-hidden"
    >
      {/* Floating ambient lights */}
      <div className="absolute -top-40 left-10 w-72 h-72 bg-primary/20 blur-3xl rounded-full animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-200/30 blur-3xl rounded-full animate-pulse delay-1000" />

      <div className="relative max-w-6xl mx-auto px-8 text-center z-10">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl font-extrabold text-gray-900 mb-6"
        >
          How <span className="text-primary">NeuraSense</span> Works
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-gray-600 max-w-3xl mx-auto mb-16 text-lg leading-relaxed"
        >
          A transparent, AI-powered process designed for insight — not intrusion.
          NeuraSense learns from your digital expression to help you stay emotionally aware and mentally balanced.
        </motion.p>

        <div className="grid md:grid-cols-3 gap-10 perspective-[1000px]">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={i}
                style={{
                  rotateX,
                  rotateY,
                }}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2, type: "spring", stiffness: 70 }}
                className="relative bg-white/80 backdrop-blur-md border border-white/40 p-10 rounded-2xl shadow-lg hover:shadow-primary/30 hover:scale-[1.03] transition-all duration-300"
              >
                {/* glowing edge */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-blue-200/20 opacity-0 hover:opacity-100 transition-opacity duration-700" />

                <div className="flex justify-center mb-6 relative z-10">
                  <div className="bg-primary/10 p-5 rounded-full shadow-inner">
                    <Icon className="h-10 w-10 text-primary" />
                  </div>
                </div>

                <h3 className="text-2xl font-semibold mb-3 text-gray-900 relative z-10">{step.title}</h3>
                <p className="text-gray-600 text-base leading-relaxed relative z-10">{step.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
