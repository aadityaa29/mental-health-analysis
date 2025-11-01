import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NeuraSense | Mental Health Analysis",
  description:
    "Analyze your mental health using social media behavior with NeuraSense 🧠 — powered by AI and psychology insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900`}
      >
        {/* ✅ Global Navbar on all pages */}
        <Navbar />

        {/* ✅ Main Content */}
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
