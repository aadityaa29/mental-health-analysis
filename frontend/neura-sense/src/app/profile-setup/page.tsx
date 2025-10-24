// "use client"
// import { useState } from "react"
// import { motion } from "framer-motion"
// import { Button } from "@/components/ui/button"
// import { Progress } from "@/components/ui/progress"
// import StepOneBasicInfo from "@/components/StepOneBasicInfo"
// import StepTwoHabits from "@/components/StepTwoHabits"
// import StepThreeConnect from "@/components/StepThreeConnect"
// import { nav } from "framer-motion/client"
// import Navbar from "@/components/Navbar"

// export default function ProfileSetup() {
//   const [step, setStep] = useState(1)

//   const nextStep = () => setStep((prev) => Math.min(prev + 1, 3))
//   const prevStep = () => setStep((prev) => Math.max(prev - 1, 1))

//   return (
//     <nav>
//       <Navbar/>
   
//     <section className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-calm to-white">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6 }}
//         className="w-full max-w-2xl bg-white rounded-2xl shadow-md p-8"
//       >
//         <h2 className="text-3xl font-bold text-center mb-8 text-primary">
//           Let’s set up your NeuraSense profile 🧠
//         </h2>

//         <Progress value={(step / 3) * 100} className="h-3 mb-8" />

//         <div className="mb-8">
//           {step === 1 && <StepOneBasicInfo />}
//           {step === 2 && <StepTwoHabits />}
//           {step === 3 && <StepThreeConnect />}
//         </div>

//         <div className="flex justify-between">
//           <Button variant="outline" onClick={prevStep} disabled={step === 1}>
//             Back
//           </Button>

//           {step < 3 ? (
//             <Button onClick={nextStep}>Next</Button>
//           ) : (
//             <Button className="bg-primary text-white">Finish Setup</Button>
//           )}
//         </div>
//       </motion.div>
//     </section>
//      </nav>
//   )
// }



// NEW CODE (UPGRADED)

"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Github, Twitter, Instagram, Loader2 } from "lucide-react"
import { useUser } from "@clerk/nextjs"

export default function ProfileSetup() {
  const [loading, setLoading] = useState(false)
  const { user } = useUser()
  const [connected, setConnected] = useState<{ [key: string]: boolean }>({
    twitter: false,
    instagram: false,
  })

  const handleConnect = (platform: string) => {
    setLoading(true)
    setTimeout(() => {
      setConnected(prev => ({ ...prev, [platform]: true }))
      setLoading(false)
    }, 1200)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center py-12 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl w-full"
      >
        <Card className="shadow-md border border-indigo-100 rounded-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Let’s Set Up Your Profile 🌱
            </CardTitle>
            <p className="text-gray-500 mt-1">
              We’ll personalize your analysis based on this information.
            </p>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Personal Info */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Enter your name" />
                </div>
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" type="number" placeholder="Your age" />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    className="w-full border border-gray-300 rounded-lg p-2 text-gray-700"
                  >
                    <option>Select gender</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                    <option>Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="sleep">Average Sleep (hrs)</Label>
                  <Input id="sleep" type="number" placeholder="e.g. 7" />
                </div>
              </div>
            </section>

            {/* Mood Info */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Current Mood</h3>
              <p className="text-gray-500 mb-3 text-sm">
                How have you been feeling recently on a scale of 1 (low) to 10 (high)?
              </p>
              <input
                type="range"
                min="1"
                max="10"
                defaultValue="6"
                className="w-full accent-indigo-600"
              />
            </section>

            {/* Social Connect */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Connect Social Media (Optional)
              </h3>
              <p className="text-gray-500 mb-3 text-sm">
                Connect platforms to analyze behavior patterns for early mental health detection.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button
                  variant="outline"
                  disabled={loading || connected.twitter}
                  onClick={() => handleConnect("twitter")}
                >
                  {connected.twitter ? (
                    <>
                      <Twitter className="mr-2 text-sky-500" /> Connected
                    </>
                  ) : loading ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" /> Connecting...
                    </>
                  ) : (
                    <>
                      <Twitter className="mr-2 text-sky-500" /> Connect Twitter
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  disabled={loading || connected.instagram}
                  onClick={() => handleConnect("instagram")}
                >
                  {connected.instagram ? (
                    <>
                      <Instagram className="mr-2 text-pink-500" /> Connected
                    </>
                  ) : loading ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" /> Connecting...
                    </>
                  ) : (
                    <>
                      <Instagram className="mr-2 text-pink-500" /> Connect Instagram
                    </>
                  )}
                </Button>

                <Button variant="outline" disabled>
                  <Github className="mr-2 text-gray-700" /> Coming Soon
                </Button>
              </div>
            </section>

            {/* Submit */}
            <div className="text-center mt-8">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2">
                Save & Continue
              </Button>
              <p className="text-gray-500 text-sm mt-2">You can always edit this later.</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  )
}
