'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import StoryboardCanvas from '@/components/StoryboardCanvas'
import { Storyboard, getStoryboards, saveStoryboard, Project, saveProject } from '@/lib/storage'

export default function StoryboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [storyboards, setStoryboards] = useState<Storyboard[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [showNew, setShowNew] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }
    async function load() {
      if (!user) return
      const all = await getStoryboards()
      const mine = all.filter((s) => s.userId === user.id)
      setStoryboards(mine)
      if (mine.length > 0 && !activeId) {
        setActiveId(mine[0].id)
      }
    }
    if (user) load()
  }, [user, loading, router, activeId])

  if (loading) return <div className="p-12 text-center text-steel-400">Loading...</div>
  if (!user) return null

  const createStoryboard = async () => {
    if (!newName.trim()) return
    const sb: Storyboard = {
      id: `sb-${Date.now()}`,
      userId: user.id,
      name: newName,
      elements: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    await saveStoryboard(sb)
    setStoryboards([...storyboards, sb])
    setActiveId(sb.id)
    setNewName('')
    setShowNew(false)
  }

  const active = storyboards.find((s) => s.id === activeId)

  const submitForQuote = async () => {
    if (!active) return
    const project: Project = {
      id: `proj-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      title: active.name,
      description: `Storyboard design with ${active.elements.length} elements`,
      storyboardId: active.id,
      status: 'pending',
      feedback: [],
      createdAt: new Date().toISOString(),
    }
    await saveProject(project)
    alert('Project submitted for quote! Check your dashboard for updates.')
    router.push('/dashboard')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Storyboard</h1>
          <p className="text-steel-400 text-sm">Design and mock up your ideas.</p>
        </div>
        <div className="flex items-center gap-3">
          {active && (
            <button onClick={submitForQuote} className="btn-primary">
              Submit for Quote
            </button>
          )}
          <button onClick={() => setShowNew(true)} className="btn-secondary">
            + New Board
          </button>
        </div>
      </div>

      {showNew && (
        <div className="card mb-6">
          <h3 className="font-bold text-white mb-2">New Storyboard</h3>
          <div className="flex gap-2">
            <input
              className="input"
              placeholder="Name your design..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createStoryboard()}
            />
            <button onClick={createStoryboard} className="btn-primary">
              Create
            </button>
            <button onClick={() => setShowNew(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}

      {storyboards.length > 0 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {storyboards.map((sb) => (
            <button
              key={sb.id}
              onClick={() => setActiveId(sb.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeId === sb.id
                  ? 'bg-chilliblue-500 text-white'
                  : 'bg-steel-800 text-steel-300 hover:bg-steel-700'
              }`}
            >
              {sb.name}
            </button>
          ))}
        </div>
      )}

      {active ? (
        <StoryboardCanvas
          storyboard={active}
          onChange={(s) => {
            setStoryboards(storyboards.map((sb) => (sb.id === s.id ? s : sb)))
          }}
        />
      ) : (
        <div className="card text-center py-24">
          <p className="text-steel-400 mb-4">No storyboards yet.</p>
          <button onClick={() => setShowNew(true)} className="btn-primary">
            Create Your First Storyboard
          </button>
        </div>
      )}
    </div>
  )
}
