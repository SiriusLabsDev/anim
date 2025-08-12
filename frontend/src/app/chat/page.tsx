"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Send, Play, Download } from "lucide-react"

type LoadingState = "idle" | "generating-outline" | "generating-video" | "complete"

export default function ChatPage() {
  const [prompt, setPrompt] = useState("")
  const [loadingState, setLoadingState] = useState<LoadingState>("idle")
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setError(null)
    setVideoUrl(null)
    setLoadingState("generating-outline")

    // Switch to "generating video" after 40 seconds
    const timer = setTimeout(() => {
      setLoadingState("generating-video")
    }, 40000)

    try {
      const response = await axios.post("http://localhost:8000/chat/chat", {
        prompt: prompt.trim()
      }, {
        responseType: 'blob'
      })

      clearTimeout(timer)
      
      // Create blob URL for the video
      const videoBlob = new Blob([response.data], { type: 'video/mp4' })
      const url = URL.createObjectURL(videoBlob)
      setVideoUrl(url)
      setLoadingState("complete")
      
    } catch (err) {
      clearTimeout(timer)
      const errorMessage = err instanceof Error ? err.message : "Failed to generate video. Please try again."
      setError(errorMessage)
      setLoadingState("idle")
      console.error(err)
    }
  }

  const downloadVideo = () => {
    if (videoUrl) {
      const a = document.createElement('a')
      a.href = videoUrl
      a.download = `vizmo-${Date.now()}.mp4`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  const isLoading = loadingState === "generating-outline" || loadingState === "generating-video"

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      {/* Header */}
      <motion.header 
        className="border-b border-gray-800 bg-[#151515]"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-[#3ECF8E] to-[#2DD4BF] rounded-lg flex items-center justify-center">
              <Play className="w-4 h-4 text-black" />
            </div>
            <h1 className="text-xl font-semibold">Vizmo</h1>
            <span className="text-sm text-gray-400">Math Explainer Video Generator</span>
          </div>
        </div>
      </motion.header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <AnimatePresence>
          {!videoUrl && loadingState === "idle" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#3ECF8E] to-[#2DD4BF] bg-clip-text text-transparent">
                Create Amazing Math Videos
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Describe any math concept and watch Vizmo bring it to life with beautiful animations
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the math concept you'd like to visualize... (e.g., 'Explain the Pythagorean theorem with a visual proof')"
                className="w-full p-4 pr-16 bg-[#1A1A1A] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3ECF8E] focus:border-transparent resize-none min-h-[120px] transition-all duration-200"
                disabled={isLoading}
                rows={4}
              />
              <Button
                type="submit"
                disabled={!prompt.trim() || isLoading}
                className="absolute bottom-4 right-4 w-10 h-10 p-0"
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </motion.div>

        {/* Loading State */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="bg-[#1A1A1A] border border-gray-700 rounded-lg p-8 text-center"
            >
              <div className="flex flex-col items-center space-y-4">
                <Spinner size="lg" />
                <motion.h3
                  key={loadingState}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xl font-semibold text-[#3ECF8E]"
                >
                  {loadingState === "generating-outline" ? "Generating outline..." : "Generating video..."}
                </motion.h3>
                <p className="text-gray-400 max-w-md">
                  {loadingState === "generating-outline" 
                    ? "Analyzing your prompt and creating a detailed outline for your math video"
                    : "Creating beautiful animations with Manim. This may take a few minutes..."
                  }
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error State */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="bg-red-900/20 border border-red-700 rounded-lg p-6 mb-6"
            >
              <h3 className="text-red-400 font-semibold mb-2">Error</h3>
              <p className="text-red-300">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Video Result */}
        <AnimatePresence>
          {videoUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-[#1A1A1A] border border-gray-700 rounded-lg overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-[#3ECF8E]">Your Video</h3>
                  <Button
                    onClick={downloadVideo}
                    variant="outline"
                    size="sm"
                    className="border-[#3ECF8E] text-[#3ECF8E] hover:bg-[#3ECF8E] hover:text-black"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
                
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    controls
                    className="w-full h-full object-contain"
                    onLoadedData={() => {
                      if (videoRef.current) {
                        videoRef.current.play()
                      }
                    }}
                  >
                    Your browser does not support video playback.
                  </video>
                </div>
                
                <div className="mt-4 flex justify-center">
                  <Button
                    onClick={() => {
                      setVideoUrl(null)
                      setPrompt("")
                      setLoadingState("idle")
                      setError(null)
                    }}
                    variant="ghost"
                    className="text-gray-400 hover:text-white"
                  >
                    Create Another Video
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-[#151515] mt-12">
        <div className="max-w-4xl mx-auto px-6 py-6 text-center text-gray-400">
          <p>Powered by Manim • Built with Next.js</p>
        </div>
      </footer>
    </div>
  )
}