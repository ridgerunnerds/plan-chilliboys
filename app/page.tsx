'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { categories, concepts, textures } from '@/lib/data'
import BirdEasterEgg from '@/components/BirdEasterEgg'

/* ─── Blueprint SVG decorations ─── */
function BlueprintDecorations() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.06] md:opacity-[0.08]">
      {/* Gate outline — hidden on small screens, shown md+ */}
      <svg className="hidden md:block absolute top-[10%] left-[5%] w-40 h-28 lg:w-64 lg:h-48" viewBox="0 0 200 150">
        <rect x="10" y="10" width="180" height="130" fill="none" stroke="white" strokeWidth="1" />
        <line x1="10" y1="40" x2="190" y2="40" stroke="white" strokeWidth="0.5" />
        <line x1="10" y1="75" x2="190" y2="75" stroke="white" strokeWidth="0.5" />
        <line x1="10" y1="110" x2="190" y2="110" stroke="white" strokeWidth="0.5" />
        <line x1="50" y1="10" x2="50" y2="140" stroke="white" strokeWidth="0.5" />
        <line x1="100" y1="10" x2="100" y2="140" stroke="white" strokeWidth="0.5" />
        <line x1="150" y1="10" x2="150" y2="140" stroke="white" strokeWidth="0.5" />
        <text x="100" y="145" fill="white" fontSize="6" textAnchor="middle" fontFamily="monospace">GATE ELEVATION</text>
      </svg>

      {/* Handrail detail — hidden on small screens */}
      <svg className="hidden md:block absolute top-[15%] right-[8%] w-32 h-20 lg:w-48 lg:h-32" viewBox="0 0 150 100">
        <rect x="20" y="20" width="110" height="8" fill="none" stroke="white" strokeWidth="1" />
        <line x1="30" y1="28" x2="30" y2="80" stroke="white" strokeWidth="0.5" />
        <line x1="50" y1="28" x2="50" y2="80" stroke="white" strokeWidth="0.5" />
        <line x1="70" y1="28" x2="70" y2="80" stroke="white" strokeWidth="0.5" />
        <line x1="90" y1="28" x2="90" y2="80" stroke="white" strokeWidth="0.5" />
        <line x1="110" y1="28" x2="110" y2="80" stroke="white" strokeWidth="0.5" />
        <line x1="20" y1="80" x2="130" y2="80" stroke="white" strokeWidth="1" />
        <text x="75" y="92" fill="white" fontSize="5" textAnchor="middle" fontFamily="monospace">HANDRAIL SECTION A-A</text>
      </svg>

      {/* Pergola plan — small on mobile, bigger on desktop */}
      <svg className="absolute bottom-[8%] left-[4%] md:bottom-[12%] md:left-[10%] w-28 h-20 md:w-44 md:h-36 lg:w-56 lg:h-44" viewBox="0 0 180 140">
        <rect x="20" y="20" width="140" height="100" fill="none" stroke="white" strokeWidth="1" />
        <line x1="40" y1="20" x2="40" y2="120" stroke="white" strokeWidth="0.5" />
        <line x1="80" y1="20" x2="80" y2="120" stroke="white" strokeWidth="0.5" />
        <line x1="120" y1="20" x2="120" y2="120" stroke="white" strokeWidth="0.5" />
        <line x1="20" y1="50" x2="160" y2="50" stroke="white" strokeWidth="0.5" />
        <line x1="20" y1="90" x2="160" y2="90" stroke="white" strokeWidth="0.5" />
        <circle cx="40" cy="50" r="3" fill="none" stroke="white" strokeWidth="0.5" />
        <circle cx="120" cy="50" r="3" fill="none" stroke="white" strokeWidth="0.5" />
        <circle cx="40" cy="90" r="3" fill="none" stroke="white" strokeWidth="0.5" />
        <circle cx="120" cy="90" r="3" fill="none" stroke="white" strokeWidth="0.5" />
        <text x="90" y="132" fill="white" fontSize="5" textAnchor="middle" fontFamily="monospace">PERGOLA PLAN VIEW</text>
      </svg>

      {/* Stair profile — hidden on small screens */}
      <svg className="hidden md:block absolute bottom-[18%] right-[5%] w-36 h-24 lg:w-52 lg:h-40" viewBox="0 0 160 120">
        <polyline points="10,110 10,90 40,90 40,70 70,70 70,50 100,50 100,30 130,30 130,10 150,10" fill="none" stroke="white" strokeWidth="1" />
        <line x1="10" y1="110" x2="150" y2="110" stroke="white" strokeWidth="0.5" />
        <line x1="10" y1="10" x2="10" y2="110" stroke="white" strokeWidth="0.5" strokeDasharray="2,2" />
        <line x1="150" y1="10" x2="150" y2="110" stroke="white" strokeWidth="0.5" strokeDasharray="2,2" />
        <text x="80" y="118" fill="white" fontSize="5" textAnchor="middle" fontFamily="monospace">STAIR ELEVATION</text>
      </svg>

      {/* Corner brackets */}
      <svg className="absolute top-3 left-3 md:top-4 md:left-4 w-10 h-10 md:w-16 md:h-16" viewBox="0 0 40 40">
        <line x1="0" y1="10" x2="0" y2="0" stroke="white" strokeWidth="1" />
        <line x1="0" y1="0" x2="10" y2="0" stroke="white" strokeWidth="1" />
      </svg>
      <svg className="absolute top-3 right-3 md:top-4 md:right-4 w-10 h-10 md:w-16 md:h-16" viewBox="0 0 40 40">
        <line x1="40" y1="10" x2="40" y2="0" stroke="white" strokeWidth="1" />
        <line x1="40" y1="0" x2="30" y2="0" stroke="white" strokeWidth="1" />
      </svg>
      <svg className="absolute bottom-3 left-3 md:bottom-4 md:left-4 w-10 h-10 md:w-16 md:h-16" viewBox="0 0 40 40">
        <line x1="0" y1="30" x2="0" y2="40" stroke="white" strokeWidth="1" />
        <line x1="0" y1="40" x2="10" y2="40" stroke="white" strokeWidth="1" />
      </svg>
      <svg className="absolute bottom-3 right-3 md:bottom-4 md:right-4 w-10 h-10 md:w-16 md:h-16" viewBox="0 0 40 40">
        <line x1="40" y1="30" x2="40" y2="40" stroke="white" strokeWidth="1" />
        <line x1="40" y1="40" x2="30" y2="40" stroke="white" strokeWidth="1" />
      </svg>

      {/* Center compass rose — smaller on mobile */}
      <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 opacity-40 md:opacity-50" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="80" fill="none" stroke="white" strokeWidth="0.5" />
        <circle cx="100" cy="100" r="60" fill="none" stroke="white" strokeWidth="0.3" />
        <line x1="100" y1="20" x2="100" y2="180" stroke="white" strokeWidth="0.3" />
        <line x1="20" y1="100" x2="180" y2="100" stroke="white" strokeWidth="0.3" />
        <text x="100" y="14" fill="white" fontSize="6" textAnchor="middle" fontFamily="monospace">N</text>
        <text x="100" y="192" fill="white" fontSize="6" textAnchor="middle" fontFamily="monospace">S</text>
        <text x="14" y="102" fill="white" fontSize="6" textAnchor="middle" fontFamily="monospace">W</text>
        <text x="186" y="102" fill="white" fontSize="6" textAnchor="middle" fontFamily="monospace">E</text>
      </svg>
    </div>
  )
}

/* ─── Blueprint grid background ─── */
function BlueprintGrid() {
  return (
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)
        `,
        backgroundSize: '24px 24px',
      }}
    />
  )
}

/* ─── Main gate overlay ─── */
function BlueprintGate({ onEnter }: { onEnter: () => void }) {
  const [pressed, setPressed] = useState(false)

  const triggerEnter = useCallback(() => {
    if (pressed) return
    setPressed(true)
    setTimeout(onEnter, 600)
  }, [pressed, onEnter])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        triggerEnter()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [triggerEnter])

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#1a3a5f] transition-opacity duration-700 ${pressed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      onClick={triggerEnter}
      role="button"
      tabIndex={0}
      aria-label="Enter site"
    >
      <BlueprintGrid />
      <BlueprintDecorations />

      {/* Center content */}
      <div className="relative z-10 text-center px-4 sm:px-6">
        {/* Logo mark */}
        <div className="mb-6 md:mb-8 flex items-center justify-center">
          <svg width="60" height="60" viewBox="0 0 80 80" className="text-white opacity-90 md:w-[80px] md:h-[80px]">
            <rect x="10" y="10" width="60" height="60" fill="none" stroke="currentColor" strokeWidth="2" />
            <line x1="10" y1="10" x2="70" y2="70" stroke="currentColor" strokeWidth="1" />
            <line x1="70" y1="10" x2="10" y2="70" stroke="currentColor" strokeWidth="1" />
            <circle cx="40" cy="40" r="12" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <text x="40" y="44" fill="currentColor" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="bold">CB</text>
          </svg>
        </div>

        <h1
          className="text-3xl sm:text-5xl md:text-7xl font-bold text-white tracking-[0.15em] sm:tracking-widest mb-3 md:mb-4"
          style={{ fontFamily: 'monospace' }}
        >
          CHILLI BOYS
        </h1>
        <p
          className="text-sm sm:text-lg md:text-xl text-white/70 tracking-[0.15em] sm:tracking-[0.3em] uppercase mb-8 md:mb-12"
          style={{ fontFamily: 'monospace' }}
        >
          Engineering &amp; Fabrication
        </p>

        {/* Divider line */}
        <div className="flex items-center justify-center gap-3 md:gap-4 mb-8 md:mb-12">
          <div className="h-px w-10 sm:w-16 bg-white/30" />
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rotate-45 border border-white/50" />
          <div className="h-px w-10 sm:w-16 bg-white/30" />
        </div>

        {/* Press enter — large touch target */}
        <div className="animate-pulse">
          <button
            className="border border-white/40 bg-white/5 px-6 py-4 sm:px-8 sm:py-3 text-white tracking-[0.2em] text-xs sm:text-sm md:text-base uppercase backdrop-blur-sm active:bg-white/10 transition-colors min-h-[48px] min-w-[160px]"
            style={{ fontFamily: 'monospace' }}
            onClick={(e) => {
              e.stopPropagation()
              triggerEnter()
            }}
          >
            Press Enter
          </button>
        </div>

        <p className="mt-5 md:mt-6 text-white/30 text-[10px] sm:text-xs tracking-widest" style={{ fontFamily: 'monospace' }}>
          [ TAP ANYWHERE TO ENTER ]
        </p>
      </div>

      {/* Blueprint metadata corners — hidden on very small screens */}
      <div className="hidden sm:block absolute bottom-4 md:bottom-6 left-4 md:left-6 text-white/30 text-[10px] md:text-xs" style={{ fontFamily: 'monospace' }}>
        <div>SCALE: 1:1</div>
        <div>DWG NO: CB-2025-001</div>
        <div>REV: A</div>
      </div>
      <div className="hidden sm:block absolute bottom-4 md:bottom-6 right-4 md:right-6 text-white/30 text-[10px] md:text-xs text-right" style={{ fontFamily: 'monospace' }}>
        <div>CHILLI BOYS MFG.</div>
        <div>BAJA CALIFORNIA SUR</div>
        <div>MEXICO</div>
      </div>
    </div>
  )
}

/* ─── Page ─── */
export default function Home() {
  const [entered, setEntered] = useState(false)

  return (
    <>
      {!entered && <BlueprintGate onEnter={() => setEntered(true)} />}

      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 transition-opacity duration-1000 ${entered ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Hero */}
        <section className="text-center py-16 md:py-24">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6">
            You Dream It. <span className="text-chilliblue-400">We Build It.</span>
          </h1>
          <p className="text-lg md:text-xl text-chilliblue-100 max-w-2xl mx-auto mb-8">
            Browse our catalog of textures, concepts, and ideas. Contact us
            to design your project on our storyboard and get a custom quote.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/plan" className="btn-primary text-lg px-8 py-3">
              Get a Quote
            </Link>
            <Link href="/catalog" className="btn-secondary text-lg px-8 py-3">
              Browse Catalog
            </Link>
          </div>
        </section>

        {/* Textures */}
        <section className="py-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">
            Textures &amp; Finishes
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {textures.map((t) => (
              <div key={t.name} className="card p-4 text-center hover:border-chilliblue-500 transition-colors">
                <div
                  className="w-full h-20 rounded-lg mb-3 border border-steel-600"
                  style={{ backgroundColor: t.color, backgroundImage: `url(${t.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                />
                <p className="text-sm font-medium text-white">{t.name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Concepts */}
        <section className="py-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">
            Design Concepts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {concepts.map((c) => (
              <div key={c.title} className="card hover:border-chilliblue-500 transition-colors">
                <h3 className="text-lg font-bold text-chilliblue-300 mb-2">{c.title}</h3>
                <p className="text-steel-300 text-sm mb-4">{c.description}</p>
                <div className="flex flex-wrap gap-2">
                  {c.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-chilliblue-900 text-chilliblue-300 px-2 py-1 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Services preview */}
        <section className="py-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">
            Our Services
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.slice(0, 6).map((cat) => (
              <Link
                key={cat.slug}
                href="/catalog"
                className="card group hover:border-chilliblue-500 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-white group-hover:text-chilliblue-300 transition-colors">
                    {cat.name}
                  </h3>
                </div>
                <p className="text-steel-300 text-sm">{cat.description}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {cat.materials.slice(0, 2).map((m) => (
                    <span key={m} className="text-xs bg-steel-700 text-steel-300 px-2 py-0.5 rounded">
                      {m}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/catalog" className="btn-secondary">
              View Full Catalog
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 text-center">
          <div className="card max-w-3xl mx-auto border-chilliblue-700">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to Design Your Project?
            </h2>
            <p className="text-chilliblue-100 mb-6">
              Answer a few quick questions and we will pre-fill your project details.
              Our team will follow up within 48 hours.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/plan" className="btn-primary text-lg px-8 py-3 inline-block">
                Get a Quote
              </Link>
            </div>
          </div>
        </section>
      </div>
      {entered && <BirdEasterEgg />}
    </>
  )
}
