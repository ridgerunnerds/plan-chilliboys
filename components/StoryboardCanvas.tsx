'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { Storyboard, StoryboardElement, saveStoryboard } from '@/lib/storage'
import { categories } from '@/lib/data'

interface Props {
  storyboard: Storyboard
  onChange: (s: Storyboard) => void
  readOnly?: boolean
}

export default function StoryboardCanvas({ storyboard, onChange, readOnly }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [dragging, setDragging] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null)
  const [tool, setTool] = useState<'select' | 'text' | 'shape' | 'image'>('select')
  const [showGallery, setShowGallery] = useState(false)

  const updateElements = (elements: StoryboardElement[]) => {
    const updated = { ...storyboard, elements, updatedAt: new Date().toISOString() }
    onChange(updated)
    saveStoryboard(updated)
  }

  const addElement = (type: StoryboardElement['type'], content: string, width = 120, height = 80) => {
    const newEl: StoryboardElement = {
      id: `el-${Date.now()}`,
      type,
      x: 50 + storyboard.elements.length * 20,
      y: 50 + storyboard.elements.length * 20,
      width,
      height,
      content,
      color: type === 'shape' ? '#005ce6' : undefined,
    }
    updateElements([...storyboard.elements, newEl])
    setSelectedId(newEl.id)
  }

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    if (readOnly) return
    if (tool !== 'select') return
    e.stopPropagation()
    const el = storyboard.elements.find((x) => x.id === id)
    if (!el) return
    const rect = canvasRef.current!.getBoundingClientRect()
    setDragging({
      id,
      offsetX: e.clientX - rect.left - el.x,
      offsetY: e.clientY - rect.top - el.y,
    })
    setSelectedId(id)
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragging || !canvasRef.current) return
      const rect = canvasRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left - dragging.offsetX
      const y = e.clientY - rect.top - dragging.offsetY
      const elements = storyboard.elements.map((el) =>
        el.id === dragging.id ? { ...el, x: Math.max(0, x), y: Math.max(0, y) } : el
      )
      onChange({ ...storyboard, elements, updatedAt: new Date().toISOString() })
    },
    [dragging, storyboard, onChange]
  )

  const handleMouseUp = useCallback(() => {
    if (dragging) {
      saveStoryboard(storyboard)
      setDragging(null)
    }
  }, [dragging, storyboard])

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [dragging, handleMouseMove, handleMouseUp])

  const deleteSelected = () => {
    if (!selectedId) return
    updateElements(storyboard.elements.filter((e) => e.id !== selectedId))
    setSelectedId(null)
  }

  const updateSelected = (patch: Partial<StoryboardElement>) => {
    if (!selectedId) return
    updateElements(
      storyboard.elements.map((e) => (e.id === selectedId ? { ...e, ...patch } : e))
    )
  }

  const selectedEl = storyboard.elements.find((e) => e.id === selectedId)

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Toolbar */}
      {!readOnly && (
        <div className="lg:w-64 flex-shrink-0 space-y-4">
          <div className="card p-4">
            <h3 className="font-bold text-white mb-3">Tools</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'select', label: 'Select' },
                { key: 'text', label: 'Text' },
                { key: 'shape', label: 'Shape' },
                { key: 'image', label: 'Image' },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => {
                    setTool(t.key as any)
                    if (t.key === 'text') addElement('text', 'New note')
                    if (t.key === 'shape') addElement('shape', 'rect')
                    if (t.key === 'image') setShowGallery(true)
                  }}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    tool === t.key
                      ? 'bg-chilliblue-500 text-white'
                      : 'bg-steel-700 text-steel-200 hover:bg-steel-600'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {selectedEl && (
            <div className="card p-4">
              <h3 className="font-bold text-white mb-3">Properties</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-steel-400">Content</label>
                  <input
                    className="input text-sm"
                    value={selectedEl.content}
                    onChange={(e) => updateSelected({ content: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-steel-400">W</label>
                    <input
                      type="number"
                      className="input text-sm"
                      value={selectedEl.width}
                      onChange={(e) => updateSelected({ width: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-steel-400">H</label>
                    <input
                      type="number"
                      className="input text-sm"
                      value={selectedEl.height}
                      onChange={(e) => updateSelected({ height: Number(e.target.value) })}
                    />
                  </div>
                </div>
                {selectedEl.type === 'shape' && (
                  <div>
                    <label className="text-xs text-steel-400">Color</label>
                    <input
                      type="color"
                      className="w-full h-8 rounded cursor-pointer"
                      value={selectedEl.color || '#005ce6'}
                      onChange={(e) => updateSelected({ color: e.target.value })}
                    />
                  </div>
                )}
                <button
                  onClick={deleteSelected}
                  className="w-full bg-red-900/60 hover:bg-red-800 text-red-200 py-1.5 rounded text-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          )}

          <div className="card p-4">
            <h3 className="font-bold text-white mb-2">Instructions</h3>
            <p className="text-xs text-steel-400 leading-relaxed">
              Use the tools to add elements. Drag to move. Select an element to edit properties.
              Save is automatic.
            </p>
          </div>
        </div>
      )}

      {/* Canvas */}
      <div className="flex-1">
        <div
          ref={canvasRef}
          className="relative w-full h-[600px] bg-steel-900/40 border-2 border-dashed border-steel-700 rounded-xl overflow-hidden"
          onClick={() => setSelectedId(null)}
        >
          <div className="absolute top-4 left-4 text-steel-600 text-sm font-medium select-none pointer-events-none">
            Storyboard: {storyboard.name}
          </div>
          {storyboard.elements.map((el) => (
            <div
              key={el.id}
              onMouseDown={(e) => handleMouseDown(e, el.id)}
              onClick={(e) => { e.stopPropagation(); setSelectedId(el.id) }}
              className={`absolute cursor-move select-none ${
                selectedId === el.id ? 'ring-2 ring-chilliblue-400' : ''
              }`}
              style={{
                left: el.x,
                top: el.y,
                width: el.width,
                height: el.height,
              }}
            >
              {el.type === 'text' && (
                <div className="w-full h-full bg-steel-800/90 border border-steel-600 rounded p-2 text-sm text-white overflow-hidden">
                  {el.content}
                </div>
              )}
              {el.type === 'shape' && (
                <div
                  className="w-full h-full rounded border border-white/20"
                  style={{ backgroundColor: el.color || '#005ce6' }}
                />
              )}
              {el.type === 'image' && (
                <img
                  src={el.content}
                  alt="storyboard"
                  className="w-full h-full object-cover rounded border border-steel-600"
                  draggable={false}
                />
              )}
              {el.type === 'note' && (
                <div className="w-full h-full bg-yellow-900/30 border border-yellow-700/50 rounded p-2 text-xs text-yellow-100 overflow-hidden">
                  {el.content}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Image Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-steel-900 border border-steel-700 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Select an Image</h3>
              <button
                onClick={() => setShowGallery(false)}
                className="text-steel-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {categories.flatMap((c) => c.images).map((img, i) => (
                <button
                  key={i}
                  onClick={() => {
                    addElement('image', img, 150, 100)
                    setShowGallery(false)
                    setTool('select')
                  }}
                  className="rounded-lg overflow-hidden border border-steel-700 hover:border-chilliblue-400 transition-colors"
                >
                  <img src={img} alt="" className="w-full h-24 object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
