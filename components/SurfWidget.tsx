'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  SurfConditions,
  getSurfConditionsSmart,
  weatherDescription,
  formatWaveHeight,
  formatFeet,
  formatTemp,
  formatWind,
  moonPhaseName,
} from '@/lib/surf'

export default function SurfWidget() {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState<SurfConditions | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const conditions = await getSurfConditionsSmart()
      setData(conditions)
    } catch (err: any) {
      setError(err?.message || 'Failed to load surf data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open && !data && !loading) {
      load()
    }
  }, [open, data, loading, load])

  // Auto-refresh every 10 minutes while open
  useEffect(() => {
    if (!open) return
    const id = setInterval(() => load(), 10 * 60 * 1000)
    return () => clearInterval(id)
  }, [open, load])

  const ratingColor = (rating: string) => {
    switch (rating) {
      case 'Epic': return 'text-emerald-400'
      case 'Good': return 'text-chilliblue-400'
      case 'Fair': return 'text-yellow-400'
      case 'Poor': return 'text-red-400'
      default: return 'text-steel-400'
    }
  }

  return (
    <>
      {/* Wave icon button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-3 left-3 z-[60] w-10 h-10 rounded-full bg-steel-800/80 border border-steel-600 hover:border-chilliblue-400 flex items-center justify-center transition-colors group"
        aria-label="Surf conditions"
        title="Surf conditions"
      >
        <svg
          className="w-5 h-5 text-chilliblue-300 group-hover:text-chilliblue-200 transition-colors"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <path d="M2 12c2-3 5-3 7 0s5 3 7 0 5-3 7 0" />
          <path d="M2 16c2-3 5-3 7 0s5 3 7 0 5-3 7 0" />
          <path d="M2 8c2-3 5-3 7 0s5 3 7 0 5-3 7 0" />
        </svg>
      </button>

      {/* Digital display modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-[#0a1628] border border-steel-700 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-[#1a3a5f] to-[#0f1f35] p-6">
              <button
                onClick={() => setOpen(false)}
                className="absolute top-3 right-3 text-steel-400 hover:text-white text-xl"
                aria-label="Close"
              >
                ×
              </button>
              <div className="flex items-center gap-3">
                <svg className="w-8 h-8 text-chilliblue-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M2 12c2-3 5-3 7 0s5 3 7 0 5-3 7 0" />
                  <path d="M2 16c2-3 5-3 7 0s5 3 7 0 5-3 7 0" />
                  <path d="M2 8c2-3 5-3 7 0s5 3 7 0 5-3 7 0" />
                </svg>
                <div>
                  <h2 className="text-lg font-bold text-white">El Pescadero</h2>
                  <p className="text-xs text-steel-400">Baja California Sur</p>
                </div>
              </div>

              {data && (
                <div className="mt-4 text-center">
                  <div className="text-4xl font-bold text-white">
                    {formatWaveHeight(data.wave_height)}
                  </div>
                  <div className="text-sm text-steel-400">
                    {formatFeet(data.wave_height)} — {data.wave_period?.toFixed(1)}s
                  </div>
                  <div className={`text-sm font-bold mt-1 uppercase tracking-wider ${ratingColor(data.surf_rating)}`}>
                    {data.surf_rating}
                  </div>
                </div>
              )}
            </div>

            {/* Body */}
            <div className="p-4 space-y-3">
              {loading && (
                <div className="text-center py-4 text-steel-400 text-sm">Loading conditions...</div>
              )}

              {error && (
                <div className="bg-red-900/30 border border-red-700 text-red-200 px-3 py-2 rounded text-sm">
                  {error}
                </div>
              )}

              {data && (
                <>
                  {/* Wave details */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-steel-800/50 rounded-lg p-3">
                      <p className="text-[10px] text-steel-500 uppercase tracking-wider">Wave Height</p>
                      <p className="text-lg font-bold text-white">{formatWaveHeight(data.wave_height)}</p>
                      <p className="text-xs text-steel-400">{formatFeet(data.wave_height)}</p>
                    </div>
                    <div className="bg-steel-800/50 rounded-lg p-3">
                      <p className="text-[10px] text-steel-500 uppercase tracking-wider">Period</p>
                      <p className="text-lg font-bold text-white">{data.wave_period?.toFixed(1) ?? '--'}s</p>
                      <p className="text-xs text-steel-400">Seconds</p>
                    </div>
                    <div className="bg-steel-800/50 rounded-lg p-3">
                      <p className="text-[10px] text-steel-500 uppercase tracking-wider">Sea Temp</p>
                      <p className="text-lg font-bold text-white">{formatTemp(data.sea_temp)}</p>
                      <p className="text-xs text-steel-400">Surface</p>
                    </div>
                    <div className="bg-steel-800/50 rounded-lg p-3">
                      <p className="text-[10px] text-steel-500 uppercase tracking-wider">Tide</p>
                      <p className="text-lg font-bold text-white">{data.tide_height?.toFixed(2) ?? '--'}m</p>
                      <p className="text-xs text-steel-400">Above MSL</p>
                    </div>
                  </div>

                  {/* Weather row */}
                  <div className="bg-steel-800/50 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-steel-500 uppercase tracking-wider">Weather</p>
                      <p className="text-sm font-bold text-white">{weatherDescription(data.weather_code)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-steel-500 uppercase tracking-wider">Air</p>
                      <p className="text-sm font-bold text-white">{formatTemp(data.air_temp)}</p>
                    </div>
                  </div>

                  {/* Wind & Humidity */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-steel-800/50 rounded-lg p-3">
                      <p className="text-[10px] text-steel-500 uppercase tracking-wider">Wind</p>
                      <p className="text-sm font-bold text-white">{formatWind(data.wind_speed, data.wind_direction)}</p>
                    </div>
                    <div className="bg-steel-800/50 rounded-lg p-3">
                      <p className="text-[10px] text-steel-500 uppercase tracking-wider">Humidity</p>
                      <p className="text-sm font-bold text-white">{data.humidity ?? '--'}%</p>
                    </div>
                  </div>

                  {/* Moon */}
                  <div className="bg-steel-800/50 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-steel-500 uppercase tracking-wider">Moon</p>
                      <p className="text-sm font-bold text-white">
                        {data.moon_phase !== null ? moonPhaseName(data.moon_phase) : '--'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-steel-500 uppercase tracking-wider">Illumination</p>
                      <p className="text-sm font-bold text-white">
                        {data.moon_phase !== null ? `${Math.round((1 - Math.abs(data.moon_phase - 0.5) * 2) * 100)}%` : '--'}
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-[10px] text-steel-600">
                      Updated {new Date(data.fetched_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <button
                      onClick={load}
                      disabled={loading}
                      className="text-xs text-chilliblue-400 hover:text-chilliblue-300 disabled:opacity-50 transition-colors"
                    >
                      Refresh
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
