'use client'

import Link from 'next/link'
import { categories, concepts, textures } from '@/lib/data'

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <section className="text-center py-16 md:py-24">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6">
          You Dream It. <span className="text-chilliblue-400">We Build It.</span>
        </h1>
        <p className="text-lg md:text-xl text-chilliblue-100 max-w-2xl mx-auto mb-8">
          Browse our catalog of textures, concepts, and ideas. Then create a free account
          to design your project on our storyboard and get a custom quote.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/catalog" className="btn-primary text-lg px-8 py-3">
            Browse Catalog
          </Link>
          <Link href="/register" className="btn-secondary text-lg px-8 py-3">
            Create Account
          </Link>
        </div>
      </section>

      {/* Textures */}
      <section className="py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">
          Textures & Finishes
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
            Create a free account to access our storyboard tool. Drag, drop, and sketch your ideas.
            Our team will review and send you a quote within 48 hours.
          </p>
          <Link href="/register" className="btn-primary text-lg px-8 py-3 inline-block">
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  )
}
