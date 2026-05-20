/* ─── Surf / Marine Conditions ───
 * Fetches from Open-Meteo (free, no API key) and caches in Supabase.
 * El Pescadero, BCS coordinates: 23.37, -110.17
 */

import { supabase } from './supabase'

export interface SurfConditions {
  id: string
  fetched_at: string
  wave_height: number | null
  wave_period: number | null
  wave_direction: number | null
  sea_temp: number | null
  tide_height: number | null
  air_temp: number | null
  humidity: number | null
  wind_speed: number | null
  wind_direction: number | null
  weather_code: number | null
  moon_phase: number | null
  surf_rating: string
}

const LAT = 23.37
const LON = -110.17
const LOCATION_ID = 'el-pescadero'
const CACHE_MS = 60 * 60 * 1000 // 1 hour

/* ─── Moon Phase Calculation ─── */
function getMoonPhase(date: Date): number {
  let year = date.getFullYear()
  let month = date.getMonth() + 1
  const day = date.getDate()
  let c, e, jd, b
  if (month < 3) {
    year--
    month += 12
  }
  c = 365.25 * year
  e = 30.6 * month
  jd = c + e + day - 694039.09
  jd /= 29.5305882
  b = parseInt(jd as unknown as string)
  jd -= b
  b = Math.round(jd * 8)
  return b / 8
}

function moonPhaseName(phase: number): string {
  if (phase < 0.06) return 'New Moon'
  if (phase < 0.19) return 'Waxing Crescent'
  if (phase < 0.31) return 'First Quarter'
  if (phase < 0.44) return 'Waxing Gibbous'
  if (phase < 0.56) return 'Full Moon'
  if (phase < 0.69) return 'Waning Gibbous'
  if (phase < 0.81) return 'Last Quarter'
  if (phase < 0.94) return 'Waning Crescent'
  return 'New Moon'
}

/* ─── Surf Rating ─── */
function calculateSurfRating(
  waveHeight: number | null,
  wavePeriod: number | null,
  windSpeed: number | null,
  windDirection: number | null
): string {
  if (!waveHeight || !wavePeriod) return 'Unknown'

  let score = 0

  // Wave height scoring (meters)
  if (waveHeight >= 1.5 && waveHeight <= 3) score += 3
  else if (waveHeight >= 1 && waveHeight < 1.5) score += 2
  else if (waveHeight >= 0.5 && waveHeight < 1) score += 1
  else if (waveHeight > 3) score += 2

  // Wave period scoring
  if (wavePeriod >= 14) score += 3
  else if (wavePeriod >= 10) score += 2
  else if (wavePeriod >= 7) score += 1

  // Wind scoring (offshore = good for El Pescadero, wind from N/NE/E)
  // Onshore = bad (wind from W/SW/S)
  if (windSpeed !== null && windDirection !== null) {
    const offshore = windDirection >= 0 && windDirection <= 135
    if (offshore && windSpeed < 15) score += 2
    else if (offshore && windSpeed < 25) score += 1
    else if (!offshore && windSpeed > 20) score -= 1
  }

  if (score >= 6) return 'Epic'
  if (score >= 4) return 'Good'
  if (score >= 2) return 'Fair'
  return 'Poor'
}

/* ─── Fetch from Open-Meteo ─── */
async function fetchMarineData(): Promise<Partial<SurfConditions>> {
  const [marineRes, weatherRes] = await Promise.all([
    fetch(
      `https://marine-api.open-meteo.com/v1/marine?latitude=${LAT}&longitude=${LON}&hourly=wave_height,wave_direction,wave_period,sea_surface_temperature&forecast_days=1&timezone=auto`
    ),
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&hourly=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m&forecast_days=1&timezone=auto`
    ),
  ])

  if (!marineRes.ok) throw new Error(`Marine API error: ${marineRes.status}`)
  if (!weatherRes.ok) throw new Error(`Weather API error: ${weatherRes.status}`)

  const marine = await marineRes.json()
  const weather = await weatherRes.json()

  // Get current hour index
  const now = new Date()
  const currentHour = now.getHours()

  const mHourly = marine.hourly
  const wHourly = weather.hourly

  return {
    wave_height: mHourly.wave_height?.[currentHour] ?? null,
    wave_period: mHourly.wave_period?.[currentHour] ?? null,
    wave_direction: mHourly.wave_direction?.[currentHour] ?? null,
    sea_temp: mHourly.sea_surface_temperature?.[currentHour] ?? null,
    tide_height: null,
    air_temp: wHourly.temperature_2m?.[currentHour] ?? null,
    humidity: wHourly.relative_humidity_2m?.[currentHour] ?? null,
    weather_code: wHourly.weather_code?.[currentHour] ?? null,
    wind_speed: wHourly.wind_speed_10m?.[currentHour] ?? null,
    wind_direction: wHourly.wind_direction_10m?.[currentHour] ?? null,
  }
}

/* ─── Supabase Cache ─── */
export async function getSurfConditions(): Promise<SurfConditions | null> {
  const { data, error } = await supabase
    .from('surf_conditions')
    .select('*')
    .eq('id', LOCATION_ID)
    .limit(1)

  if (error) {
    console.error('Surf cache read error:', error)
    return null
  }

  if (!data || data.length === 0) return null

  const row = data[0] as SurfConditions
  const age = Date.now() - new Date(row.fetched_at).getTime()

  // Stale? Return it anyway but caller may choose to refresh
  return { ...row, _stale: age > CACHE_MS } as any
}

export async function fetchAndCacheSurfConditions(): Promise<SurfConditions> {
  const marineData = await fetchMarineData()
  const moonPhase = getMoonPhase(new Date())

  const conditions: SurfConditions = {
    id: LOCATION_ID,
    fetched_at: new Date().toISOString(),
    wave_height: marineData.wave_height ?? null,
    wave_period: marineData.wave_period ?? null,
    wave_direction: marineData.wave_direction ?? null,
    sea_temp: marineData.sea_temp ?? null,
    tide_height: marineData.tide_height ?? null,
    air_temp: marineData.air_temp ?? null,
    humidity: marineData.humidity ?? null,
    wind_speed: marineData.wind_speed ?? null,
    wind_direction: marineData.wind_direction ?? null,
    weather_code: marineData.weather_code ?? null,
    moon_phase: moonPhase,
    surf_rating: calculateSurfRating(
      marineData.wave_height ?? null,
      marineData.wave_period ?? null,
      marineData.wind_speed ?? null,
      marineData.wind_direction ?? null
    ),
  }

  // Upsert to Supabase (ignore errors - we'll still return the data)
  try {
    await supabase.from('surf_conditions').upsert(conditions, { onConflict: 'id' })
  } catch (err) {
    console.error('Surf cache write error:', err)
  }

  return conditions
}

/* ─── Smart Fetch (cache-aware) ─── */
export async function getSurfConditionsSmart(): Promise<SurfConditions> {
  const cached = await getSurfConditions()
  const stale = cached ? (cached as any)._stale : true

  if (!cached || stale) {
    try {
      return await fetchAndCacheSurfConditions()
    } catch (err) {
      console.error('Fresh fetch failed, falling back to cache:', err)
      if (cached) return cached as SurfConditions
      throw err
    }
  }

  return cached as SurfConditions
}

/* ─── Weather Code to Description ─── */
export function weatherDescription(code: number | null): string {
  if (code === null) return 'Unknown'
  const codes: Record<number, string> = {
    0: 'Clear', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
    45: 'Fog', 48: 'Depositing Rime Fog',
    51: 'Light Drizzle', 53: 'Moderate Drizzle', 55: 'Dense Drizzle',
    56: 'Light Freezing Drizzle', 57: 'Dense Freezing Drizzle',
    61: 'Slight Rain', 63: 'Moderate Rain', 65: 'Heavy Rain',
    66: 'Light Freezing Rain', 67: 'Heavy Freezing Rain',
    71: 'Slight Snow', 73: 'Moderate Snow', 75: 'Heavy Snow',
    77: 'Snow Grains',
    80: 'Slight Showers', 81: 'Moderate Showers', 82: 'Violent Showers',
    85: 'Slight Snow Showers', 86: 'Heavy Snow Showers',
    95: 'Thunderstorm', 96: 'Thunderstorm with Hail', 99: 'Thunderstorm with Heavy Hail',
  }
  return codes[code] || 'Unknown'
}

/* ─── Helpers ─── */
export function formatWaveHeight(m: number | null): string {
  if (m === null) return '--'
  return `${m.toFixed(1)}m`
}

export function formatFeet(m: number | null): string {
  if (m === null) return '--'
  return `${(m * 3.28084).toFixed(1)}ft`
}

export function formatTemp(c: number | null): string {
  if (c === null) return '--'
  return `${Math.round(c)}°C`
}

export function formatWind(kmh: number | null, direction: number | null): string {
  if (kmh === null) return '--'
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  const dir = direction !== null ? dirs[Math.round(direction / 22.5) % 16] : ''
  return `${Math.round(kmh)} km/h ${dir}`
}

export { moonPhaseName, getMoonPhase }
