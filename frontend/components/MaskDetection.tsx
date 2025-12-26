"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Upload, Loader2, CheckCircle2, XCircle, Video, Square } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface Detection {
  x: number
  y: number
  width: number
  height: number
  has_mask: boolean
  confidence: number
}

interface DetectionResult {
  detections: Detection[]
  image: string
  total_faces: number
}

export default function MaskDetection() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<DetectionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamInterval, setStreamInterval] = useState<NodeJS.Timeout | null>(null)
  const [apiConnected, setApiConnected] = useState<boolean | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    // Test API connection on mount
    const testConnection = async () => {
      try {
        const response = await fetch(`${API_URL}/health`)
        if (response.ok) {
          const data = await response.json()
          setApiConnected(true)
          console.log("API connected:", data)
        } else {
          setApiConnected(false)
        }
      } catch (err) {
        setApiConnected(false)
        console.error("API connection test failed:", err)
      }
    }
    testConnection()
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (streamInterval) {
        clearInterval(streamInterval)
      }
    }
  }, [streamInterval])

  const startCamera = async () => {
    try {
      setError(null)
      console.log("Requesting camera access...")
      
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Camera API not available in this browser. Please use Chrome, Firefox, or Edge.")
        return
      }
      
      // Request camera with simpler constraints first
      const constraints = {
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      }
      
      console.log("Calling getUserMedia with constraints:", constraints)
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      console.log("Camera stream obtained:", stream)
      
      streamRef.current = stream
      
      if (!videoRef.current) {
        console.error("Video ref is null")
        setError("Video element not found")
        return
      }
      
      const video = videoRef.current
      
      // Set the stream
      video.srcObject = stream
      console.log("Stream assigned to video element")
      
      // Wait for video metadata to load
      const handleLoadedMetadata = () => {
        console.log("Video metadata loaded, dimensions:", video.videoWidth, video.videoHeight)
        video.play()
          .then(() => {
            console.log("Video playback started")
            setIsStreaming(true)
            setError(null)
          })
          .catch((playErr) => {
            console.error("Video play error:", playErr)
            setError("Failed to start video playback. Try refreshing the page.")
          })
      }
      
      // Wait for video to be ready
      if (video.readyState >= 2) {
        // Already loaded
        handleLoadedMetadata()
      } else {
        video.onloadedmetadata = handleLoadedMetadata
      }
      
      // Also try playing immediately
      video.play().catch(err => {
        console.log("Initial play attempt failed (may be normal):", err)
      })
      
    } catch (err: any) {
      console.error("Camera access error:", err)
      const errorMsg = err?.message || err?.name || "Unknown error"
      
      if (errorMsg.includes("NotAllowedError") || errorMsg.includes("permission")) {
        setError("Camera permission denied. Please allow camera access in your browser settings and refresh the page.")
      } else if (errorMsg.includes("NotFoundError") || errorMsg.includes("not found") || errorMsg.includes("devices")) {
        setError("No camera found. Please connect a camera and try again.")
      } else if (errorMsg.includes("NotReadableError") || errorMsg.includes("in use")) {
        setError("Camera is being used by another application. Please close other apps using the camera.")
      } else if (errorMsg.includes("OverconstrainedError")) {
        setError("Camera doesn't support the requested settings. Trying with default settings...")
        // Try again with simpler constraints
        try {
          const simpleStream = await navigator.mediaDevices.getUserMedia({ video: true })
          streamRef.current = simpleStream
          if (videoRef.current) {
            videoRef.current.srcObject = simpleStream
            videoRef.current.play().then(() => setIsStreaming(true))
          }
        } catch (retryErr) {
          setError(`Camera error: ${errorMsg}`)
        }
      } else {
        setError(`Failed to access camera: ${errorMsg}. Check browser console for details.`)
      }
    }
  }

  const stopCamera = () => {
    console.log("Stopping camera...")
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop()
        console.log("Stopped track:", track.kind, track.label)
      })
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    if (streamInterval) {
      clearInterval(streamInterval)
    }
    setIsStreaming(false)
    setStreamInterval(null)
    console.log("Camera stopped")
  }

  const captureFrame = (): string | null => {
    console.log("Attempting to capture frame...")
    
    // Try to get video element from ref first, then from DOM
    let video: HTMLVideoElement | null = videoRef.current
    if (!video) {
      console.log("Video ref is null, trying to find video element in DOM...")
      video = document.querySelector('video') as HTMLVideoElement
      if (!video) {
        console.error("Video element not found in DOM")
        setError("Video element not found. Please start the camera first.")
        return null
      }
      console.log("Found video element in DOM")
    }
    
    // Try to get canvas element from ref first, then create one if needed
    let canvas: HTMLCanvasElement | null = canvasRef.current
    if (!canvas) {
      console.log("Canvas ref is null, creating temporary canvas...")
      canvas = document.createElement('canvas')
      if (!canvas) {
        console.error("Could not create canvas element")
        setError("Could not create canvas element.")
        return null
      }
    }
    
    console.log("Video element:", video)
    console.log("Canvas element:", canvas)
    
    console.log("Video state:", {
      readyState: video.readyState,
      width: video.videoWidth,
      height: video.videoHeight,
      paused: video.paused,
      ended: video.ended,
      srcObject: !!video.srcObject
    })
    
    // Check if video has a stream
    if (!video.srcObject) {
      console.error("Video has no stream")
      setError("Camera stream not available. Please start the camera first.")
      return null
    }
    
    // Check if video has dimensions (readyState 2 = HAVE_CURRENT_DATA, 4 = HAVE_ENOUGH_DATA)
    if (video.readyState < 2) {
      console.error("Video not ready, readyState:", video.readyState)
      setError("Video is still loading. Please wait a moment and try again.")
      return null
    }
    
    // Check if video has valid dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.error("Video has no dimensions", { width: video.videoWidth, height: video.videoHeight })
      setError("Video has no dimensions. Camera may not be working properly.")
      return null
    }
    
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      console.error("Could not get canvas context")
      setError("Could not get canvas context")
      return null
    }
    
    try {
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      console.log("Drawing video to canvas...", { width: canvas.width, height: canvas.height })
      
      // Draw the current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      console.log("Converting canvas to data URL...")
      
      // Convert to data URL
      const dataUrl = canvas.toDataURL("image/jpeg", 0.8)
      
      if (!dataUrl || dataUrl.length < 100) {
        console.error("Invalid data URL generated")
        setError("Failed to generate image data")
        return null
      }
      
      console.log("Frame captured successfully, data length:", dataUrl.length)
      return dataUrl
      
    } catch (err: any) {
      console.error("Error capturing frame:", err)
      setError(`Failed to capture frame: ${err?.message || "Unknown error"}`)
      return null
    }
  }

  const processImage = async (imageData: string) => {
    if (!imageData || imageData.length === 0) {
      setError("No image data to process")
      return
    }
    
    setIsProcessing(true)
    setError(null)
    
    try {
      console.log("Sending image to API...", API_URL)
      const response = await fetch(`${API_URL}/detect-base64`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: imageData }),
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error("API error response:", errorText)
        throw new Error(`Failed to process image: ${response.status} ${response.statusText}`)
      }
      
      const data: DetectionResult = await response.json()
      console.log("Detection result:", data)
      
      if (!data || !data.detections) {
        throw new Error("Invalid response from server")
      }
      
      setResult(data)
    } catch (err: any) {
      const errorMsg = err?.message || "An error occurred"
      if (errorMsg.includes("fetch") || errorMsg.includes("network") || errorMsg.includes("Failed to fetch")) {
        setError("Cannot connect to backend server. Make sure the backend is running on http://localhost:8000")
      } else {
        setError(errorMsg)
      }
      console.error("Detection error:", err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      console.log("No file selected")
      return
    }
    
    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (jpg, png, etc.)")
      return
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image file is too large. Please select an image smaller than 10MB")
      return
    }
    
    console.log("Reading file:", file.name, file.type, file.size)
    setError(null)
    
    const reader = new FileReader()
    reader.onload = (event) => {
      const imageData = event.target?.result as string
      if (imageData) {
        console.log("File read successfully, processing...")
        processImage(imageData)
      } else {
        setError("Failed to read image file")
      }
    }
    reader.onerror = () => {
      setError("Error reading file")
      console.error("FileReader error")
    }
    reader.readAsDataURL(file)
    
    // Reset input so same file can be selected again
    e.target.value = ""
  }

  const handleCapture = () => {
    console.log("Capture button clicked, isStreaming:", isStreaming)
    console.log("Video ref:", videoRef.current)
    console.log("Canvas ref:", canvasRef.current)
    
    if (!isStreaming) {
      setError("Please start the camera first by clicking 'Start Camera'")
      return
    }
    
    // Check if video element exists in DOM
    const videoElement = document.querySelector('video')
    if (!videoElement) {
      console.error("Video element not found in DOM")
      setError("Video element not found. Please refresh the page and try again.")
      return
    }
    
    // Double check ref
    if (!videoRef.current) {
      console.error("Video ref is null, but element exists in DOM")
      // Try to get the element directly
      const video = document.querySelector('video') as HTMLVideoElement
      if (video) {
        // Force update the ref
        console.log("Found video element in DOM, attempting capture...")
        // Continue with capture using the element
      } else {
        setError("Video element not found. Please refresh the page and try again.")
        return
      }
    }
    
    // Wait a bit for video to be ready if needed
    const video = videoRef.current || document.querySelector('video') as HTMLVideoElement
    if (!video) {
      setError("Cannot access video element. Please refresh the page.")
      return
    }
    
    if (video.readyState < 2) {
      setError("Camera is still initializing. Please wait a moment and try again.")
      // Try again after a short delay
      setTimeout(() => {
        const imageData = captureFrame()
        if (imageData) {
          console.log("Frame captured after delay, processing...")
          processImage(imageData)
        }
      }, 1000)
      return
    }
    
    const imageData = captureFrame()
    if (imageData) {
      console.log("Frame captured successfully, processing...")
      setError(null) // Clear any previous errors
      processImage(imageData)
    } else {
      // Error is already set by captureFrame
      console.error("Failed to capture frame")
    }
  }

  const startContinuousDetection = () => {
    if (!isStreaming) {
      setError("Please start the camera first")
      return
    }
    
    if (streamInterval) {
      clearInterval(streamInterval)
    }
    
    console.log("Starting continuous detection...")
    
    const interval = setInterval(() => {
      if (!isStreaming || !videoRef.current) {
        console.log("Stopping continuous detection - camera not available")
        clearInterval(interval)
        setStreamInterval(null)
        return
      }
      
      // Only capture if video is ready
      if (videoRef.current.readyState >= 2 && videoRef.current.videoWidth > 0) {
        const imageData = captureFrame()
        if (imageData) {
          processImage(imageData)
        }
      } else {
        console.log("Skipping capture - video not ready")
      }
    }, 2000) // Process every 2 seconds to avoid overwhelming the API
    
    setStreamInterval(interval)
  }

  const stopContinuousDetection = () => {
    if (streamInterval) {
      clearInterval(streamInterval)
      setStreamInterval(null)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Card className="mb-6 shadow-lg border-2">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Face Mask Detection System
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Upload an image or use your webcam to detect face masks in real-time using AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 mb-6 justify-center">
            <Button
              onClick={isStreaming ? stopCamera : startCamera}
              variant={isStreaming ? "destructive" : "default"}
              disabled={isProcessing}
              size="lg"
              className="shadow-md hover:shadow-lg transition-shadow"
            >
              {isStreaming ? (
                <>
                  <Square className="mr-2 h-4 w-4" />
                  Stop Camera
                </>
              ) : (
                <>
                  <Video className="mr-2 h-4 w-4" />
                  Start Camera
                </>
              )}
            </Button>
            
            {isStreaming && (
              <>
                <Button
                  onClick={handleCapture}
                  variant="outline"
                  disabled={isProcessing}
                  size="lg"
                  className="shadow-md hover:shadow-lg transition-shadow"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Capture Frame
                </Button>
                
                <Button
                  onClick={streamInterval ? stopContinuousDetection : startContinuousDetection}
                  variant={streamInterval ? "destructive" : "secondary"}
                  disabled={isProcessing}
                  size="lg"
                  className="shadow-md hover:shadow-lg transition-shadow"
                >
                  {streamInterval ? "Stop Auto-Detection" : "Start Auto-Detection"}
                </Button>
              </>
            )}
            
            <div>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isProcessing}
              />
              <Button
                onClick={() => document.getElementById("file-upload")?.click()}
                variant="outline"
                disabled={isProcessing}
                size="lg"
                className="cursor-pointer shadow-md hover:shadow-lg transition-shadow"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
              </Button>
            </div>
          </div>

          {apiConnected === false && (
            <div className="mb-4 p-4 bg-yellow-500/10 border-2 border-yellow-500 rounded-lg text-yellow-700 dark:text-yellow-400 shadow-md">
              <p className="font-semibold">⚠️ Backend Not Connected</p>
              <p>Cannot connect to backend server at {API_URL}. Please make sure the backend is running.</p>
              <p className="text-sm mt-2">Run: <code className="bg-black/10 px-2 py-1 rounded">cd backend && python app.py</code></p>
            </div>
          )}
          
          {error && (
            <div className="mb-4 p-4 bg-destructive/10 border-2 border-destructive rounded-lg text-destructive shadow-md">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Video/Image Input */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-foreground">Input</h3>
              <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden aspect-video shadow-2xl border-2 border-gray-800">
                {/* Always render video element (hidden when not streaming) */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-contain ${isStreaming ? '' : 'hidden'}`}
                  onLoadedMetadata={() => {
                    console.log("Video metadata loaded")
                    if (videoRef.current) {
                      videoRef.current.play().catch(err => console.log("Auto-play:", err))
                    }
                  }}
                  onCanPlay={() => {
                    console.log("Video can play")
                    if (videoRef.current && !isStreaming) {
                      setIsStreaming(true)
                    }
                  }}
                  onPlay={() => console.log("Video is playing")}
                  onError={(e) => {
                    console.error("Video error:", e)
                    setError("Video playback error occurred")
                  }}
                />
                
                {/* Show result image when available */}
                {result && !isStreaming && (
                  <img
                    src={result.image}
                    alt="Processed"
                    className="w-full h-full object-contain"
                  />
                )}
                
                {/* Show placeholder when no stream and no result */}
                {!isStreaming && !result && (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Camera className="h-16 w-16 mb-4 opacity-50" />
                    <p className="text-sm">No input yet</p>
                    <p className="text-xs mt-2 opacity-75">Click "Start Camera" or "Upload Image"</p>
                  </div>
                )}
                
                {/* Status indicators */}
                {isStreaming && videoRef.current && videoRef.current.readyState >= 2 && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold z-10">
                    ● Live ({videoRef.current.videoWidth}x{videoRef.current.videoHeight})
                  </div>
                )}
                {isStreaming && videoRef.current && videoRef.current.readyState < 2 && (
                  <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-bold z-10">
                    Loading...
                  </div>
                )}
                
                {/* Canvas for capturing frames - always rendered but hidden */}
                <canvas ref={canvasRef} className="hidden" />
              </div>
            </div>

            {/* Results */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-foreground">Results</h3>
              {isProcessing ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px] bg-muted/50 rounded-xl">
                  <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                  <p className="text-sm text-muted-foreground">Processing image...</p>
                </div>
              ) : result ? (
                <div className="space-y-4">
                  <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border-2 border-primary/20 shadow-lg">
                    <p className="text-sm font-medium mb-2 text-muted-foreground">Detection Summary</p>
                    <p className="text-3xl font-bold text-primary">
                      {result.total_faces} {result.total_faces === 1 ? "Face" : "Faces"} Detected
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    {result.detections.map((detection, index) => (
                      <div
                        key={index}
                        className={`p-5 rounded-xl border-2 shadow-md transition-all hover:shadow-lg ${
                          detection.has_mask
                            ? "border-green-500 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900"
                            : "border-red-500 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {detection.has_mask ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600" />
                            )}
                            <span className="font-semibold">
                              {detection.has_mask ? "Mask Detected" : "No Mask"}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {Math.round(detection.confidence * 100)}% confidence
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          Position: ({detection.x}, {detection.y}) | 
                          Size: {detection.width} × {detection.height}px
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px] bg-muted/30 rounded-xl border-2 border-dashed border-muted-foreground/20">
                  <p className="text-muted-foreground">No detection results yet</p>
                  <p className="text-sm text-muted-foreground mt-2">Upload an image or start camera to begin</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

