"use client"
import { motion } from "framer-motion"
import { Progress } from "@/components/ui/progress"

export default function AccuracySection() {
  return (
    <section id="accuracy" className="py-24 px-8 md:px-16 bg-gradient-to-b from-calm to-white">
      <div className="max-w-5xl mx-auto text-center space-y-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-gray-900"
        >
          Our <span className="text-primary">AI Model</span> Accuracy
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-600 max-w-3xl mx-auto leading-relaxed"
        >
          Trained on thousands of anonymized social media posts, our sentiment and emotion detection model
          achieves high reliability in identifying early mental health indicators — while keeping your privacy our top priority.
        </motion.p>

        <div className="flex flex-col md:flex-row justify-center items-center gap-12 mt-10">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-8 rounded-2xl shadow-md w-[300px]"
          >
            <h3 className="text-lg font-semibold mb-3">Model Accuracy</h3>
            <Progress value={88} className="h-3 mb-2" />
            <p className="text-sm text-gray-500">88% validated on test data</p>
          </motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-8 rounded-2xl shadow-md w-[300px]"
          >
            <h3 className="text-lg font-semibold mb-3">User Privacy</h3>
            <Progress value={100} className="h-3 mb-2 bg-green-300" />
            <p className="text-sm text-gray-500">100% end-to-end secure analysis</p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
