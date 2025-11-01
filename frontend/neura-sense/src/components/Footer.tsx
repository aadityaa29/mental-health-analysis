"use client"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Github, Twitter, Instagram, ArrowUp } from "lucide-react"

export default function Footer() {
  const [showScroll, setShowScroll] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) setShowScroll(true)
      else setShowScroll(false)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <motion.footer
      id="contact"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative overflow-hidden bg-gradient-to-b from-white via-[#f8faff] to-[#eef6ff] border-t border-gray-200 pt-16 pb-10 text-center"
    >
      {/* Background glow */}
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-gradient-to-tr from-indigo-400/30 to-purple-300/20 blur-[120px] opacity-70" />

      {/* Logo + Tagline */}
      <div className="relative z-10 mb-8">
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl md:text-3xl font-bold text-gray-800 mb-2"
        >
          NeuraSense 🧠
        </motion.h3>
        <p className="text-gray-500 text-base max-w-md mx-auto">
          Empowering digital well-being through{" "}
          <span className="text-primary font-medium">AI-driven insights</span>.
        </p>
      </div>

      {/* Social Icons */}
      <div className="flex justify-center gap-8 mb-8 relative z-10">
        {[
          { Icon: Github, href: "https://github.com" },
          { Icon: Twitter, href: "https://twitter.com" },
          { Icon: Instagram, href: "https://instagram.com" },
        ].map(({ Icon, href }, i) => (
          <motion.a
            key={i}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.2, y: -3 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="p-3 rounded-full bg-white shadow-md hover:shadow-lg border border-gray-100 text-gray-600 hover:text-primary transition-all duration-300"
          >
            <Icon className="w-6 h-6" />
          </motion.a>
        ))}
      </div>

      {/* Divider line */}
      <div className="relative z-10 w-3/4 mx-auto h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-6" />

      {/* Footer note */}
      <p className="relative z-10 text-sm text-gray-400">
        © {new Date().getFullYear()}{" "}
        <span className="text-gray-500 font-medium">NeuraSense</span>. All rights reserved.
      </p>

      {/* Scroll to Top Button */}
      {showScroll && (
        <motion.button
          onClick={scrollToTop}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.4 }}
          className="fixed bottom-8 right-8 p-4 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 text-white shadow-lg hover:shadow-[0_0_20px_rgba(147,51,234,0.6)] transition-all duration-300 z-50"
        >
          <ArrowUp className="w-5 h-5" />
        </motion.button>
      )}
    </motion.footer>
  )
}
