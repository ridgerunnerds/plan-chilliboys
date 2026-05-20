'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Logo from './Logo'

interface BirdResult {
  name: string
  scientific: string
  description: string
}

export default function BirdEasterEgg({ variant = 'floating' }: { variant?: 'floating' | 'inline' }) {
  const [open, setOpen] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [captured, setCaptured] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<BirdResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Start camera when modal opens
  useEffect(() => {
    if (!open) {
      stopCamera()
      return
    }
    startCamera()
  }, [open])

  const startCamera = async () => {
    try {
      setError(null)
      setCaptured(null)
      setResult(null)
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      setError('Could not access camera. Please allow camera permissions.')
      console.error(err)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  const capture = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || !stream) return

    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (zoom > 1) {
      // Crop to center for digital zoom effect
      const sw = (video.videoWidth || 640) / zoom
      const sh = (video.videoHeight || 480) / zoom
      const sx = ((video.videoWidth || 640) - sw) / 2
      const sy = ((video.videoHeight || 480) - sh) / 2
      ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
    } else {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
    setCaptured(dataUrl)
    stopCamera()
    identifyBird(dataUrl)
  }, [stream, zoom])

  const identifyBird = async (dataUrl: string) => {
    setLoading(true)
    setError(null)
    try {
      const base64 = dataUrl.split(',')[1]
      const apiKey = 'sk_Xldaes8JEJe8lGKFrNYPm0tsJxeiXlV9'

      const res = await fetch('https://gen.pollinations.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'openai',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Look at this photo and identify the bird species. Reply with just three lines:\n1. Common Name: [name]\n2. Scientific Name: [name]\n3. Brief Description: [1 sentence]\n\nIf no bird is visible, say "No bird detected" on the first line.',
                },
                {
                  type: 'image_url',
                  image_url: { url: `data:image/jpeg;base64,${base64}` },
                },
              ],
            },
          ],
        }),
      })

      if (!res.ok) {
        const errText = await res.text().catch(() => '')
        throw new Error(`API error ${res.status}: ${errText}`)
      }

      const data = await res.json()
      const text = data.choices?.[0]?.message?.content || ''

      // Parse the three-line response
      const lines = text.split('\n').filter((l: string) => l.trim())
      let name = 'Unknown'
      let scientific = 'N/A'
      let description = text

      for (const line of lines) {
        const lower = line.toLowerCase()
        if (lower.includes('common name:')) {
          name = line.split(':').slice(1).join(':').trim()
        } else if (lower.includes('scientific name:')) {
          scientific = line.split(':').slice(1).join(':').trim()
        } else if (lower.includes('brief description:') || lower.includes('description:')) {
          description = line.split(':').slice(1).join(':').trim()
        }
      }

      if (name !== 'Unknown') {
        setResult({ name, scientific, description })
      } else {
        setResult({ name: 'Unknown', scientific: 'N/A', description: text })
      }
    } catch (err: any) {
      console.error(err)
      setError(err?.message || 'Failed to identify bird. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setCaptured(null)
    setResult(null)
    setError(null)
    setZoom(1)
    startCamera()
  }

  const close = () => {
    setOpen(false)
    setCaptured(null)
    setResult(null)
    setError(null)
    stopCamera()
  }

  return (
    <>
      {/* Bird trigger */}
      {variant === 'floating' ? (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-chilliblue-800/80 border border-chilliblue-600/50 backdrop-blur-sm flex items-center justify-center hover:bg-chilliblue-700 hover:scale-110 transition-all shadow-lg group"
          aria-label="Bird identifier easter egg"
          title="Bird ID"
        >
          <Logo className="w-6 h-auto" />
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="text-steel-500 hover:text-white transition-colors"
          aria-label="Bird identifier easter egg"
          title="Bird ID"
        >
          <Logo className="w-6 h-auto" />
        </button>
      )}

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-chilliblue-900 border border-chilliblue-700 rounded-xl max-w-md w-full overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-chilliblue-800">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Logo className="w-5 h-auto text-chilliblue-400" />
                Bird Identifier
              </h3>
              <button
                onClick={close}
                className="text-steel-400 hover:text-white transition-colors text-xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="p-4">
              {error && !result && !loading && (
                <div className="text-red-400 text-sm text-center mb-3">{error}</div>
              )}

              {/* Camera preview */}
              {!captured && !loading && (
                <>
                  <div className="relative rounded-lg overflow-hidden bg-black aspect-[4/3]">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{
                        transform: `scale(${zoom})`,
                        transformOrigin: 'center center',
                      }}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                      <button
                        onClick={capture}
                        className="w-14 h-14 rounded-full border-4 border-white/80 bg-white/20 hover:bg-white/40 transition-colors flex items-center justify-center"
                        aria-label="Take photo"
                      >
                        <div className="w-10 h-10 rounded-full bg-white" />
                      </button>
                    </div>
                  </div>
                  {/* Zoom slider */}
                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-white text-xs font-medium">1x</span>
                    <input
                      type="range"
                      min={1}
                      max={3}
                      step={0.1}
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="flex-1 h-1.5 appearance-none rounded-full bg-chilliblue-700 accent-chilliblue-400 cursor-pointer"
                      aria-label="Zoom"
                    />
                    <span className="text-white text-xs font-medium">{zoom.toFixed(1)}x</span>
                  </div>
                </>
              )}

              {/* Captured image */}
              {captured && (
                <div className="relative rounded-lg overflow-hidden bg-black aspect-[4/3]">
                  <img src={captured} alt="Captured" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Loading */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="w-8 h-8 border-2 border-chilliblue-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-chilliblue-200 text-sm">Identifying bird...</p>
                </div>
              )}

              {/* Result */}
              {result && !loading && (
                <div className="mt-4 p-3 rounded-lg bg-chilliblue-800/50 border border-chilliblue-700">
                  <p className="text-white font-bold text-lg">{result.name}</p>
                  <p className="text-chilliblue-300 text-sm italic">{result.scientific}</p>
                  <p className="text-steel-300 text-sm mt-2">{result.description}</p>
                </div>
              )}

              {/* Actions */}
              {(result || error) && !loading && (
                <div className="flex justify-center mt-4">
                  <button
                    onClick={reset}
                    className="btn-primary text-sm px-4 py-2"
                  >
                    Take Another Photo
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Hidden canvas for capture */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}
    </>
  )
}
