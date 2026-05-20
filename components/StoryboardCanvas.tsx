'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { Storyboard, StoryboardElement, saveStoryboard } from '@/lib/storage'
import { categories, concepts, textures } from '@/lib/data'

interface Props {
  storyboard: Storyboard
  onChange: (s: Storyboard) => void
  readOnly?: boolean
}

/* ─── Pollinations AI ─── */
async function generatePollinationsImage(prompt: string, width = 1024, height = 576): Promise<string> {
  const seed = Math.floor(Math.random() * 1000000)
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&nologo=true&seed=${seed}&model=flux&enhance=true`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Pollinations error: ${res.status}`)
  const blob = await res.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/* ─── Helpers ─── */
const NOTE_COLORS = [
  { bg: '#fef3c7', text: '#92400e', name: 'Yellow' },
  { bg: '#dbeafe', text: '#1e40af', name: 'Blue' },
  { bg: '#dcfce7', text: '#166534', name: 'Green' },
  { bg: '#fce7f3', text: '#9d174d', name: 'Pink' },
  { bg: '#f3e8ff', text: '#6b21a8', name: 'Purple' },
  { bg: '#ffedd5', text: '#9a3412', name: 'Orange' },
]

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max)
}

export default function StoryboardCanvas({ storyboard, onChange, readOnly }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  /* Canvas state */
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })

  /* Selection & tool */
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [tool, setTool] = useState<'select' | 'text' | 'title' | 'shape' | 'note' | 'image' | 'upload' | 'ai' | 'service' | 'concept' | 'swatch'>('select')
  const [showGallery, setShowGallery] = useState(false)
  const [showServicePicker, setShowServicePicker] = useState(false)
  const [showConceptPicker, setShowConceptPicker] = useState(false)
  const [showSwatchPicker, setShowSwatchPicker] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')

  /* Dragging items */
  const [dragging, setDragging] = useState<{
    id: string
    startMouseX: number
    startMouseY: number
    startElX: number
    startElY: number
  } | null>(null)

  /* Refs for event handlers (always current) */
  const zoomRef = useRef(zoom)
  const panRef = useRef(pan)
  const isPanningRef = useRef(isPanning)
  const panStartRef = useRef(panStart)
  const draggingRef = useRef<typeof dragging>(null)
  const storyboardRef = useRef(storyboard)

  useEffect(() => { zoomRef.current = zoom }, [zoom])
  useEffect(() => { panRef.current = pan }, [pan])
  useEffect(() => { isPanningRef.current = isPanning }, [isPanning])
  useEffect(() => { panStartRef.current = panStart }, [panStart])
  useEffect(() => { draggingRef.current = dragging }, [dragging])
  useEffect(() => { storyboardRef.current = storyboard }, [storyboard])

  const updateElements = (elements: StoryboardElement[]) => {
    const updated = { ...storyboard, elements, updatedAt: new Date().toISOString() }
    onChange(updated)
    saveStoryboard(updated).catch((err) => console.error('Failed to save storyboard:', err))
  }

  type CreateType = StoryboardElement['type'] | 'ai'
  interface CreateElement {
    type: CreateType
    x?: number
    y?: number
    width?: number
    height?: number
    content?: string
    color?: string
    fontSize?: number
    fillOpacity?: number
    borderColor?: string
    borderWidth?: number
    data?: StoryboardElement['data']
  }
  const addElement = (el: CreateElement) => {
    const canvasW = canvasRef.current?.clientWidth || 800
    const canvasH = canvasRef.current?.clientHeight || 600
    const baseX = (-pan.x + canvasW / 2 - 60) / zoom
    const baseY = (-pan.y + canvasH / 2 - 40) / zoom
    const offset = storyboard.elements.length * 20

    const defaults: Record<string, Partial<StoryboardElement>> = {
      text: { width: 140, height: 80, content: 'New note', fontSize: 14 },
      title: { width: 200, height: 40, content: 'New Title', fontSize: 24, color: '#ffffff' },
      shape: { width: 120, height: 80, content: 'rect', color: '#005ce6', fillOpacity: 1, borderColor: '#ffffff', borderWidth: 1 },
      note: { width: 160, height: 120, content: 'Sticky note', color: NOTE_COLORS[0].bg },
      image: { width: 180, height: 120, content: '' },
      upload: { width: 180, height: 120, content: '' },
      ai: { width: 180, height: 120, content: '', prompt: '', promptHistory: [], images: [], currentImageIndex: 0 },
      service: { width: 220, height: 160, content: '' },
      concept: { width: 220, height: 140, content: '' },
      swatch: { width: 140, height: 100, content: '' },
    }

    const elType = el.type as string
    const { type: _type, ...elRest } = el
    const newEl: StoryboardElement = {
      id: `el-${Date.now()}`,
      type: elType === 'ai' ? 'image' : (el.type as StoryboardElement['type']),
      x: baseX + offset,
      y: baseY + offset,
      ...defaults[elType === 'ai' ? 'ai' : elType],
      ...elRest,
    }

    updateElements([...storyboard.elements, newEl])
    setSelectedId(newEl.id)
    if ((el.type as string) === 'ai') setAiPrompt('')
  }

  /* ─── Pan & Zoom ─── */
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.08 : 0.08
      setZoom((z) => clamp(z + delta, 0.1, 4))
    },
    []
  )

  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (readOnly) return
    // Only pan if clicking empty canvas (not on an item)
    if ((e.target as HTMLElement).closest('[data-canvas-item]')) return
    setIsPanning(true)
    isPanningRef.current = true
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }
    setSelectedId(null)
  }

  /* ─── Item Drag ─── */
  const handleItemMouseDown = (e: React.MouseEvent, id: string) => {
    if (readOnly) return
    if (tool !== 'select') return
    e.stopPropagation()
    const el = storyboard.elements.find((x) => x.id === id)
    if (!el) return
    const dragState = {
      id,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startElX: el.x,
      startElY: el.y,
    }
    setDragging(dragState)
    draggingRef.current = dragState
    setSelectedId(id)
  }

  /* ─── Global mouse events (registered once, reads from refs) ─── */
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (isPanningRef.current) {
        setPan({ x: e.clientX - panStartRef.current.x, y: e.clientY - panStartRef.current.y })
      }
      if (draggingRef.current) {
        const d = draggingRef.current
        const dx = (e.clientX - d.startMouseX) / zoomRef.current
        const dy = (e.clientY - d.startMouseY) / zoomRef.current
        const newX = d.startElX + dx
        const newY = d.startElY + dy
        onChange({
          ...storyboardRef.current,
          elements: storyboardRef.current.elements.map((el) =>
            el.id === d.id ? { ...el, x: newX, y: newY } : el
          ),
          updatedAt: new Date().toISOString(),
        })
      }
    }
    const onUp = () => {
      if (isPanningRef.current) {
        setIsPanning(false)
        isPanningRef.current = false
      }
      if (draggingRef.current) {
        saveStoryboard(storyboardRef.current).catch((err) => console.error('Failed to save storyboard:', err))
        setDragging(null)
        draggingRef.current = null
      }
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [onChange])

  /* ─── Selection & Editing ─── */
  const deleteSelected = () => {
    if (!selectedId) return
    updateElements(storyboard.elements.filter((e) => e.id !== selectedId))
    setSelectedId(null)
  }

  const updateSelected = (patch: Partial<StoryboardElement>) => {
    if (!selectedId) return
    updateElements(storyboard.elements.map((e) => (e.id === selectedId ? { ...e, ...patch } : e)))
  }

  const selectedEl = storyboard.elements.find((e) => e.id === selectedId)

  /* ─── Keyboard shortcuts ─── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const target = e.target as HTMLElement
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
        deleteSelected()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selectedId, storyboard.elements])

  /* ─── AI Generation ─── */
  const generateImage = async () => {
    if (!selectedEl || selectedEl.type !== 'image' || !aiPrompt.trim()) return
    updateSelected({ isGenerating: true })
    try {
      const dataUrl = await generatePollinationsImage(aiPrompt, 1024, 576)
      const newImage = { id: `img-${Date.now()}`, url: dataUrl, createdAt: Date.now() }
      const newPrompt = { id: `pr-${Date.now()}`, text: aiPrompt, createdAt: Date.now() }
      const images = [...(selectedEl.images || []), newImage]
      const promptHistory = [...(selectedEl.promptHistory || []), newPrompt]
      updateSelected({
        images,
        promptHistory,
        currentImageIndex: images.length - 1,
        content: dataUrl,
        prompt: aiPrompt,
        isGenerating: false,
      })
    } catch (err) {
      console.error('AI generation failed:', err)
      updateSelected({ isGenerating: false })
      alert('Image generation failed. Please try again.')
    }
  }

  /* ─── File Upload ─── */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      addElement({ type: 'upload', content: reader.result as string })
      setTool('select')
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  /* ─── Grid style ─── */
  const gridDotSize = 20 * zoom
  const gridStyle: React.CSSProperties = {
    backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)`,
    backgroundSize: `${gridDotSize}px ${gridDotSize}px`,
    backgroundPosition: `${pan.x % gridDotSize}px ${pan.y % gridDotSize}px`,
    width: '20000px',
    height: '20000px',
    position: 'absolute',
    top: 0,
    left: 0,
  }

  /* ─── Render ─── */
  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Toolbar */}
      {!readOnly && (
        <div className="lg:w-64 flex-shrink-0 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Tools */}
          <div className="card p-4">
            <h3 className="font-bold text-white mb-3">Tools</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'select', label: 'Select' },
                { key: 'text', label: 'Text' },
                { key: 'title', label: 'Title' },
                { key: 'shape', label: 'Shape' },
                { key: 'note', label: 'Note' },
                { key: 'image', label: 'Gallery' },
                { key: 'upload', label: 'Upload' },
                { key: 'ai', label: 'AI Image' },
                { key: 'service', label: 'Service' },
                { key: 'concept', label: 'Concept' },
                { key: 'swatch', label: 'Swatch' },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => {
                    setTool(t.key as any)
                    if (t.key === 'text') addElement({ type: 'text' })
                    if (t.key === 'title') addElement({ type: 'title' })
                    if (t.key === 'shape') addElement({ type: 'shape' })
                    if (t.key === 'note') addElement({ type: 'note' })
                    if (t.key === 'image') setShowGallery(true)
                    if (t.key === 'upload') fileInputRef.current?.click()
                    if (t.key === 'ai') addElement({ type: 'ai' })
                    if (t.key === 'service') setShowServicePicker(true)
                    if (t.key === 'concept') setShowConceptPicker(true)
                    if (t.key === 'swatch') setShowSwatchPicker(true)
                  }}
                  className={`px-2 py-2 rounded text-xs font-medium transition-colors ${
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

          {/* Properties */}
          {selectedEl && (
            <div className="card p-4">
              <h3 className="font-bold text-white mb-3">Properties</h3>
              <div className="space-y-3">
                {/* Content */}
                {(selectedEl.type === 'text' || selectedEl.type === 'title' || selectedEl.type === 'note') && !['service','concept','swatch'].includes(selectedEl.type) && (
                  <div>
                    <label className="text-xs text-steel-400">Content</label>
                    <textarea
                      className="input text-sm w-full min-h-[60px] resize-none"
                      value={selectedEl.content || ''}
                      onChange={(e) => updateSelected({ content: e.target.value })}
                    />
                  </div>
                )}

                {/* Size */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-steel-400">W</label>
                    <input
                      type="number"
                      className="input text-sm"
                      value={selectedEl.width || 0}
                      onChange={(e) => updateSelected({ width: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-steel-400">H</label>
                    <input
                      type="number"
                      className="input text-sm"
                      value={selectedEl.height || 0}
                      onChange={(e) => updateSelected({ height: Number(e.target.value) })}
                    />
                  </div>
                </div>

                {/* Font size (text / title) */}
                {(selectedEl.type === 'text' || selectedEl.type === 'title') && (
                  <div>
                    <label className="text-xs text-steel-400">Font Size</label>
                    <input
                      type="number"
                      className="input text-sm"
                      value={selectedEl.fontSize || 14}
                      onChange={(e) => updateSelected({ fontSize: Number(e.target.value) })}
                    />
                  </div>
                )}

                {/* Color (shape / note / title) */}
                {(selectedEl.type === 'shape' || selectedEl.type === 'note' || selectedEl.type === 'title') && (
                  <div>
                    <label className="text-xs text-steel-400">
                      {selectedEl.type === 'note' ? 'Note Color' : 'Color'}
                    </label>
                    {selectedEl.type === 'note' ? (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {NOTE_COLORS.map((c) => (
                          <button
                            key={c.name}
                            onClick={() => updateSelected({ color: c.bg })}
                            className={`w-6 h-6 rounded border-2 transition-colors ${
                              selectedEl.color === c.bg ? 'border-white' : 'border-transparent'
                            }`}
                            style={{ backgroundColor: c.bg }}
                            title={c.name}
                          />
                        ))}
                      </div>
                    ) : (
                      <input
                        type="color"
                        className="w-full h-8 rounded cursor-pointer mt-1"
                        value={selectedEl.color || '#ffffff'}
                        onChange={(e) => updateSelected({ color: e.target.value })}
                      />
                    )}
                  </div>
                )}

                {/* Shape extras */}
                {selectedEl.type === 'shape' && (
                  <>
                    <div>
                      <label className="text-xs text-steel-400">Fill Opacity</label>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        className="w-full"
                        value={selectedEl.fillOpacity ?? 1}
                        onChange={(e) => updateSelected({ fillOpacity: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-steel-400">Border Color</label>
                      <input
                        type="color"
                        className="w-full h-8 rounded cursor-pointer"
                        value={selectedEl.borderColor || '#ffffff'}
                        onChange={(e) => updateSelected({ borderColor: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-steel-400">Border Width</label>
                      <input
                        type="number"
                        className="input text-sm"
                        value={selectedEl.borderWidth || 1}
                        onChange={(e) => updateSelected({ borderWidth: Number(e.target.value) })}
                      />
                    </div>
                  </>
                )}

                {/* AI Panel (for image elements) */}
                {selectedEl.type === 'image' && (
                  <div className="border-t border-steel-700 pt-3 mt-3">
                    <h4 className="text-xs font-bold text-chilliblue-300 uppercase tracking-wider mb-2">
                      AI Generation
                    </h4>
                    <textarea
                      className="input text-sm w-full min-h-[50px] resize-none mb-2"
                      placeholder="Describe the image you want..."
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                    />
                    <button
                      onClick={generateImage}
                      disabled={selectedEl.isGenerating || !aiPrompt.trim()}
                      className="w-full btn-primary text-xs py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {selectedEl.isGenerating ? 'Generating...' : 'Generate Image'}
                    </button>

                    {/* Revision history */}
                    {selectedEl.images && selectedEl.images.length > 0 && (
                      <div className="mt-3">
                        <label className="text-xs text-steel-400">Revisions</label>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {selectedEl.images.map((img, idx) => (
                            <button
                              key={img.id}
                              onClick={() => {
                                updateSelected({
                                  currentImageIndex: idx,
                                  content: img.url,
                                })
                              }}
                              className={`w-10 h-10 rounded border-2 overflow-hidden ${
                                selectedEl.currentImageIndex === idx
                                  ? 'border-chilliblue-400'
                                  : 'border-steel-600'
                              }`}
                            >
                              <img src={img.url} alt="" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Prompt history */}
                    {selectedEl.promptHistory && selectedEl.promptHistory.length > 0 && (
                      <div className="mt-2">
                        <label className="text-xs text-steel-400">Prompt History</label>
                        <div className="space-y-1 mt-1 max-h-24 overflow-y-auto">
                          {selectedEl.promptHistory.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => setAiPrompt(p.text)}
                              className="text-left text-xs text-steel-300 hover:text-white truncate w-full bg-steel-800/50 px-2 py-1 rounded"
                              title={p.text}
                            >
                              {p.text}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Catalog item info */}
                {(selectedEl.type === 'service' || selectedEl.type === 'concept' || selectedEl.type === 'swatch') && (
                  <div className="border-t border-steel-700 pt-3">
                    <label className="text-xs text-steel-400">Catalog Item</label>
                    <p className="text-sm text-white font-medium mt-1">{selectedEl.data?.name || selectedEl.data?.title}</p>
                    {selectedEl.data?.description && (
                      <p className="text-xs text-steel-400 mt-1">{selectedEl.data.description}</p>
                    )}
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

          {/* Canvas Info */}
          <div className="card p-4">
            <h3 className="font-bold text-white mb-2">Canvas</h3>
            <div className="flex items-center justify-between text-sm text-steel-300 mb-2">
              <span>Zoom</span>
              <span>{Math.round(zoom * 100)}%</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setZoom((z) => clamp(z - 0.2, 0.1, 4))}
                className="flex-1 bg-steel-700 hover:bg-steel-600 text-white py-1 rounded text-xs"
              >
                −
              </button>
              <button
                onClick={() => setZoom(1)}
                className="flex-1 bg-steel-700 hover:bg-steel-600 text-white py-1 rounded text-xs"
              >
                100%
              </button>
              <button
                onClick={() => setZoom((z) => clamp(z + 0.2, 0.1, 4))}
                className="flex-1 bg-steel-700 hover:bg-steel-600 text-white py-1 rounded text-xs"
              >
                +
              </button>
            </div>
            <button
              onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }) }}
              className="w-full mt-2 bg-steel-700 hover:bg-steel-600 text-steel-200 py-1 rounded text-xs transition-colors"
            >
              Reset View
            </button>
          </div>

          <div className="card p-4">
            <h3 className="font-bold text-white mb-2">Instructions</h3>
            <p className="text-xs text-steel-400 leading-relaxed">
              Scroll to zoom. Drag empty canvas to pan. Drag items to move.
              Use Service, Concept, and Swatch tools to add catalog items.
              Press Delete to remove selected elements.
            </p>
          </div>
        </div>
      )}

      {/* Canvas */}
      <div className="flex-1">
        <div
          ref={canvasRef}
          className="relative w-full h-[600px] bg-[#0f172a] border-2 border-dashed border-steel-700 rounded-xl overflow-hidden cursor-grab active:cursor-grabbing"
          onMouseDown={handleCanvasMouseDown}
          style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
        >
          {/* Grid */}
          <div style={gridStyle} />

          {/* Transformed content */}
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
              width: 0,
              height: 0,
            }}
          >
            {storyboard.elements.map((el) => (
              <div
                key={el.id}
                data-canvas-item
                onMouseDown={(e) => handleItemMouseDown(e, el.id)}
                onClick={(e) => { e.stopPropagation(); setSelectedId(el.id) }}
                className={`absolute select-none ${
                  selectedId === el.id && !readOnly ? 'ring-2 ring-chilliblue-400' : ''
                } ${!readOnly ? 'cursor-move' : 'cursor-default'}`}
                style={{
                  left: el.x,
                  top: el.y,
                  width: el.width,
                  height: el.height,
                }}
              >
                {el.type === 'text' && (
                  <div
                    className="w-full h-full bg-steel-800/90 border border-steel-600 rounded p-2 text-white overflow-hidden"
                    style={{ fontSize: el.fontSize || 14 }}
                  >
                    {el.content}
                  </div>
                )}
                {el.type === 'title' && (
                  <div
                    className="w-full h-full flex items-center font-bold overflow-hidden"
                    style={{ fontSize: el.fontSize || 24, color: el.color || '#ffffff' }}
                  >
                    {el.content}
                  </div>
                )}
                {el.type === 'shape' && (
                  <div
                    className="w-full h-full rounded"
                    style={{
                      backgroundColor: el.color || '#005ce6',
                      opacity: el.fillOpacity ?? 1,
                      borderColor: el.borderColor || '#ffffff',
                      borderWidth: el.borderWidth || 1,
                      borderStyle: 'solid',
                    }}
                  />
                )}
                {el.type === 'image' && (
                  <img
                    src={el.content || ''}
                    alt="storyboard"
                    className="w-full h-full object-cover rounded border border-steel-600"
                    draggable={false}
                  />
                )}
                {el.type === 'upload' && (
                  <img
                    src={el.content || ''}
                    alt="uploaded"
                    className="w-full h-full object-cover rounded border border-steel-600"
                    draggable={false}
                  />
                )}
                {el.type === 'note' && (
                  <div
                    className="w-full h-full rounded p-2 text-xs overflow-hidden shadow-sm"
                    style={{
                      backgroundColor: el.color || NOTE_COLORS[0].bg,
                      color: NOTE_COLORS.find((c) => c.bg === el.color)?.text || NOTE_COLORS[0].text,
                    }}
                  >
                    {el.content}
                  </div>
                )}
                {el.type === 'service' && (
                  <div className="w-full h-full bg-steel-800 border border-steel-600 rounded overflow-hidden flex flex-col">
                    {el.data?.image && (
                      <img src={el.data.image} alt="" className="w-full h-16 object-cover" draggable={false} />
                    )}
                    <div className="p-2 flex-1 overflow-hidden">
                      <p className="text-xs font-bold text-white truncate">{el.data?.name}</p>
                      <p className="text-[10px] text-steel-400 line-clamp-2 mt-0.5">{el.data?.description}</p>
                      {el.data?.materials && (
                        <div className="flex flex-wrap gap-0.5 mt-1">
                          {el.data.materials.slice(0, 2).map((m) => (
                            <span key={m} className="text-[9px] bg-steel-700 text-steel-300 px-1 rounded">{m}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {el.type === 'concept' && (
                  <div className="w-full h-full bg-steel-800 border border-chilliblue-700/50 rounded p-2 overflow-hidden flex flex-col">
                    <p className="text-xs font-bold text-chilliblue-300">{el.data?.title}</p>
                    <p className="text-[10px] text-steel-400 mt-1 line-clamp-3">{el.data?.description}</p>
                    {el.data?.tags && (
                      <div className="flex flex-wrap gap-0.5 mt-auto pt-1">
                        {el.data.tags.map((t) => (
                          <span key={t} className="text-[9px] bg-chilliblue-900 text-chilliblue-300 px-1 rounded">#{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {el.type === 'swatch' && (
                  <div className="w-full h-full rounded overflow-hidden border border-steel-600 flex flex-col">
                    <div
                      className="flex-1"
                      style={{
                        backgroundColor: el.data?.color || '#888',
                        backgroundImage: el.data?.image ? `url(${el.data.image})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                    <div className="bg-steel-800 px-2 py-1">
                      <p className="text-[10px] text-white truncate">{el.data?.name}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Storyboard name label */}
          <div className="absolute top-3 left-3 text-steel-500 text-xs font-medium select-none pointer-events-none bg-[#0f172a]/80 px-2 py-1 rounded">
            {storyboard.name}
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

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
                    addElement({ type: 'image', content: img, width: 180, height: 120 })
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

      {/* Service Picker Modal */}
      {showServicePicker && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-steel-900 border border-steel-700 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Select a Service</h3>
              <button
                onClick={() => setShowServicePicker(false)}
                className="text-steel-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => {
                    addElement({
                      type: 'service',
                      content: cat.name,
                      data: {
                        name: cat.name,
                        description: cat.description,
                        image: cat.images[0],
                        materials: cat.materials,
                      },
                    })
                    setShowServicePicker(false)
                    setTool('select')
                  }}
                  className="text-left bg-steel-800 border border-steel-700 hover:border-chilliblue-400 rounded-lg p-3 transition-colors"
                >
                  {cat.images[0] && (
                    <img src={cat.images[0]} alt="" className="w-full h-24 object-cover rounded mb-2" />
                  )}
                  <p className="text-sm font-bold text-white">{cat.name}</p>
                  <p className="text-xs text-steel-400 line-clamp-2 mt-1">{cat.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Concept Picker Modal */}
      {showConceptPicker && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-steel-900 border border-steel-700 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Select a Design Concept</h3>
              <button
                onClick={() => setShowConceptPicker(false)}
                className="text-steel-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <div className="space-y-3">
              {concepts.map((c) => (
                <button
                  key={c.title}
                  onClick={() => {
                    addElement({
                      type: 'concept',
                      content: c.title,
                      data: {
                        title: c.title,
                        description: c.description,
                        tags: c.tags,
                      },
                    })
                    setShowConceptPicker(false)
                    setTool('select')
                  }}
                  className="text-left w-full bg-steel-800 border border-steel-700 hover:border-chilliblue-400 rounded-lg p-3 transition-colors"
                >
                  <p className="text-sm font-bold text-chilliblue-300">{c.title}</p>
                  <p className="text-xs text-steel-400 mt-1">{c.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {c.tags.map((t) => (
                      <span key={t} className="text-xs bg-chilliblue-900 text-chilliblue-300 px-2 py-0.5 rounded">#{t}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Swatch Picker Modal */}
      {showSwatchPicker && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-steel-900 border border-steel-700 rounded-xl max-w-3xl w-full max-h-[80vh] overflow-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Select a Texture / Finish</h3>
              <button
                onClick={() => setShowSwatchPicker(false)}
                className="text-steel-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {textures.map((t) => (
                <button
                  key={t.name}
                  onClick={() => {
                    addElement({
                      type: 'swatch',
                      content: t.name,
                      data: {
                        name: t.name,
                        color: t.color,
                        image: t.image,
                      },
                    })
                    setShowSwatchPicker(false)
                    setTool('select')
                  }}
                  className="text-left bg-steel-800 border border-steel-700 hover:border-chilliblue-400 rounded-lg overflow-hidden transition-colors"
                >
                  <div
                    className="w-full h-20"
                    style={{
                      backgroundColor: t.color,
                      backgroundImage: `url(${t.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                  <div className="p-2">
                    <p className="text-xs text-white truncate">{t.name}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
