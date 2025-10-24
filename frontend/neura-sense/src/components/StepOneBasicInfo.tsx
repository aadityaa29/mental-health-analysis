"use client"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function StepOneBasicInfo() {
  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div>
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" placeholder="Enter your name" />
      </div>

      <div className="flex gap-6">
        <div className="flex-1">
          <Label htmlFor="age">Age</Label>
          <Input id="age" type="number" placeholder="Your age" />
        </div>
        <div className="flex-1">
          <Label htmlFor="gender">Gender</Label>
          <select
            id="gender"
            className="w-full border border-gray-300 rounded-lg p-2"
          >
            <option>Select</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>
      </div>

      <div>
        <Label htmlFor="occupation">Occupation</Label>
        <Input id="occupation" placeholder="Student / Professional / etc." />
      </div>
    </motion.div>
  )
}
