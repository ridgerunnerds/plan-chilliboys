'use client'

import { useState } from 'react'
import { categories, textures, concepts } from '@/lib/data'

export default function CatalogPage() {
  const [activeTab, setActiveTab] = useState<'services' | 'textures' | 'concepts'>('services')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const category = selectedCategory
    ? categories.find((c) => c.slug === selectedCategory)
    : null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Catalog</h1>
      <p className="text-chilliblue-200 mb-8">
        Browse textures, concepts, and services from Chilli Boys Manufacturing.
      </p>

      <div className="flex space-x-2 mb-8">
        {(['services', 'textures', 'concepts'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setSelectedCategory(null) }}
            className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'bg-chilliblue-500 text-white'
                : 'bg-steel-800 text-steel-300 hover:bg-steel-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'services' && (
        <div>
          {selectedCategory && category ? (
            <div className="mb-8">
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-chilliblue-400 hover:text-chilliblue-300 text-sm mb-4 inline-flex items-center"
              >
                ← Back to all services
              </button>
              <h2 className="text-2xl font-bold text-white mb-2">{category.name}</h2>
              <p className="text-steel-300 mb-4">{category.description}</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {category.materials.map((m) => (
                  <span key={m} className="text-xs bg-chilliblue-900 text-chilliblue-300 px-3 py-1 rounded-full">
                    {m}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.images.map((img, i) => (
                  <div key={i} className="rounded-xl overflow-hidden border border-steel-700 bg-steel-900">
                    <img src={img} alt={`${category.name} ${i + 1}`} className="w-full h-64 object-cover" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className="card text-left hover:border-chilliblue-500 transition-colors group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-white group-hover:text-chilliblue-300 transition-colors">
                      {cat.name}
                    </h3>
                    <span className="text-steel-500 text-sm">→</span>
                  </div>
                  <p className="text-steel-300 text-sm mb-3">{cat.description}</p>
                  {cat.images[0] && (
                    <img
                      src={cat.images[0]}
                      alt={cat.name}
                      className="w-full h-40 object-cover rounded-lg border border-steel-700"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'textures' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {textures.map((t) => (
            <div key={t.name} className="card text-center">
              <div
                className="w-full h-40 rounded-lg mb-4 border border-steel-600"
                style={{
                  backgroundColor: t.color,
                  backgroundImage: `url(${t.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <h3 className="font-bold text-white">{t.name}</h3>
              <div
                className="w-8 h-8 rounded-full mx-auto mt-2 border border-steel-600"
                style={{ backgroundColor: t.color }}
              />
            </div>
          ))}
        </div>
      )}

      {activeTab === 'concepts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {concepts.map((c) => (
            <div key={c.title} className="card">
              <h3 className="text-xl font-bold text-chilliblue-300 mb-2">{c.title}</h3>
              <p className="text-steel-300 mb-4">{c.description}</p>
              <div className="flex flex-wrap gap-2">
                {c.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-chilliblue-900 text-chilliblue-300 px-3 py-1 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
