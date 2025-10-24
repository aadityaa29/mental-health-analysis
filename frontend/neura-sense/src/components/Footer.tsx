"use client"
import { motion } from "framer-motion"
import { Github, Twitter, Instagram } from "lucide-react"

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      id="contact"
      className="bg-white py-10 border-t mt-16 text-center"
    >
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        NeuraSense 🧠
      </h3>
      <p className="text-gray-500 mb-6">
        Empowering digital well-being through AI-driven insights.
      </p>

      <div className="flex justify-center gap-6 mb-6">
        <a href="https://github.com" target="_blank" className="text-gray-500 hover:text-primary">
          <Github />
        </a>
        <a href="https://twitter.com" target="_blank" className="text-gray-500 hover:text-primary">
          <Twitter />
        </a>
        <a href="https://instagram.com" target="_blank" className="text-gray-500 hover:text-primary">
          <Instagram />
        </a>
      </div>

      <p className="text-sm text-gray-400">© {new Date().getFullYear()} NeuraSense. All rights reserved.</p>
    </motion.footer>
  )
}
