"use client"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Instagram, Twitter } from "lucide-react"

export default function StepThreeConnect() {
  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 text-center"
    >
      <p className="text-gray-600">
        Connect your social media accounts to allow AI analysis.  
        You can disconnect them anytime later.
      </p>

      <div className="flex justify-center gap-6">
        <Button variant="outline" className="flex items-center gap-2">
          <Instagram className="h-4 w-4 text-pink-500" /> Connect Instagram
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Twitter className="h-4 w-4 text-sky-500" /> Connect Twitter
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          Connect Reddit
        </Button>
      </div>

      <p className="text-xs text-gray-400">
        *We never store or share your private data. Authorization is handled via official APIs.*
      </p>
    </motion.div>
  )
}
