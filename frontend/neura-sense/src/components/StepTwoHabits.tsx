"use client"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function StepTwoHabits() {
  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div>
        <Label htmlFor="sleep">Average Sleep (hours)</Label>
        <Input id="sleep" type="number" placeholder="e.g. 7" />
      </div>

      <div>
        <Label htmlFor="screen">Average Screen Time (hours/day)</Label>
        <Input id="screen" type="number" placeholder="e.g. 5" />
      </div>

      <div>
        <Label htmlFor="stress">Current Stress Level (1–10)</Label>
        <Input id="stress" type="number" placeholder="e.g. 6" />
      </div>
    </motion.div>
  )
}
