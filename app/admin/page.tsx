'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { User, Project, getUsers, getProjects, saveProject, deleteProject, FeedbackMessage } from '@/lib/storage'

export default function AdminPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [activeTab, setActiveTab] = useState<'users' | 'projects'>('projects')
  const [quoteInput, setQuoteInput] = useState<Record<string, string>>({})
  const [replyText, setReplyText] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/')
      return
    }
    setUsers(getUsers())
    setProjects(getProjects())
  }, [user, loading, router])

  if (loading) return <div className="p-12 text-center text-steel-400">Loading...</div>
  if (!user || user.role !== 'admin') return null

  const updateStatus = (project: Project, status: Project['status']) => {
    const updated = { ...project, status }
    saveProject(updated)
    setProjects(projects.map((p) => (p.id === project.id ? updated : p)))
  }

  const setQuote = (project: Project) => {
    const val = parseFloat(quoteInput[project.id])
    if (isNaN(val)) return
    const updated = { ...project, quote: val, status: 'quoted' as const }
    saveProject(updated)
    setProjects(projects.map((p) => (p.id === project.id ? updated : p)))
    setQuoteInput({ ...quoteInput, [project.id]: '' })
  }

  const sendReply = (projectId: string) => {
    const text = replyText[projectId]?.trim()
    if (!text) return
    const project = projects.find((p) => p.id === projectId)
    if (!project) return
    const msg: FeedbackMessage = {
      id: `msg-${Date.now()}`,
      from: user.name,
      fromRole: user.role,
      message: text,
      createdAt: new Date().toISOString(),
    }
    const updated = { ...project, feedback: [...project.feedback, msg] }
    saveProject(updated)
    setProjects(projects.map((p) => (p.id === projectId ? updated : p)))
    setReplyText({ ...replyText, [projectId]: '' })
  }

  const statusColor = (status: Project['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-900/50 text-yellow-200 border-yellow-700'
      case 'in_review': return 'bg-blue-900/50 text-blue-200 border-blue-700'
      case 'quoted': return 'bg-purple-900/50 text-purple-200 border-purple-700'
      case 'approved': return 'bg-green-900/50 text-green-200 border-green-700'
      case 'in_progress': return 'bg-orange-900/50 text-orange-200 border-orange-700'
      case 'completed': return 'bg-steel-700 text-steel-200 border-steel-600'
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
      <p className="text-steel-400 text-sm mb-6">Manage users, projects, and quotes.</p>

      <div className="flex space-x-2 mb-6">
        {(['projects', 'users'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
              activeTab === tab ? 'bg-chilliblue-500 text-white' : 'bg-steel-800 text-steel-300 hover:bg-steel-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'users' && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-steel-400 border-b border-steel-700">
                <th className="pb-2 pr-4">Name</th>
                <th className="pb-2 pr-4">Email</th>
                <th className="pb-2 pr-4">Role</th>
                <th className="pb-2">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-steel-800">
                  <td className="py-3 pr-4 text-white">{u.name}</td>
                  <td className="py-3 pr-4 text-steel-300">{u.email}</td>
                  <td className="py-3 pr-4">
                    <span className="text-xs bg-steel-800 text-steel-300 px-2 py-1 rounded capitalize">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 text-steel-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="space-y-6">
          {projects.length === 0 && (
            <div className="card text-center py-12">
              <p className="text-steel-400">No projects yet.</p>
            </div>
          )}
          {projects.map((project) => (
            <div key={project.id} className="card">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
                <div>
                  <h2 className="text-lg font-bold text-white">{project.title}</h2>
                  <p className="text-steel-400 text-xs">
                    {project.userName} ({project.userEmail}) — {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-3 py-1 rounded-full border capitalize ${statusColor(project.status)}`}>
                    {project.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <p className="text-steel-300 text-sm mb-4">{project.description}</p>

              {project.quote !== undefined && (
                <div className="mb-4">
                  <span className="text-sm font-bold text-green-400">
                    Quoted: ${project.quote.toLocaleString()} MXN
                  </span>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                {(['pending', 'in_review', 'quoted', 'approved', 'in_progress', 'completed'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(project, s)}
                    className={`text-xs px-3 py-1 rounded border capitalize transition-colors ${
                      project.status === s
                        ? 'bg-chilliblue-600 text-white border-chilliblue-500'
                        : 'bg-steel-800 text-steel-300 border-steel-700 hover:bg-steel-700'
                    }`}
                  >
                    {s.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 mb-4">
                <input
                  type="number"
                  className="input text-sm w-40"
                  placeholder="Set quote (MXN)"
                  value={quoteInput[project.id] || ''}
                  onChange={(e) => setQuoteInput({ ...quoteInput, [project.id]: e.target.value })}
                />
                <button onClick={() => setQuote(project)} className="btn-primary text-sm py-1.5 px-4">
                  Set Quote
                </button>
                <button
                  onClick={() => { deleteProject(project.id); setProjects(getProjects()) }}
                  className="text-sm bg-red-900/50 hover:bg-red-800 text-red-200 px-3 py-1.5 rounded transition-colors ml-auto"
                >
                  Delete
                </button>
              </div>

              {project.feedback.length > 0 && (
                <div className="bg-steel-900/50 rounded-lg p-4 mb-4 space-y-3">
                  <h3 className="text-sm font-semibold text-chilliblue-300">Feedback Thread</h3>
                  {project.feedback.map((msg) => (
                    <div key={msg.id} className="text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-white">{msg.from}</span>
                        <span className="text-xs text-steel-500 capitalize">({msg.fromRole})</span>
                        <span className="text-xs text-steel-600">
                          {new Date(msg.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-steel-300 pl-4 border-l-2 border-steel-700">{msg.message}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  className="input text-sm"
                  placeholder="Add feedback..."
                  value={replyText[project.id] || ''}
                  onChange={(e) => setReplyText({ ...replyText, [project.id]: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && sendReply(project.id)}
                />
                <button
                  onClick={() => sendReply(project.id)}
                  className="btn-secondary text-sm py-1.5 px-4"
                >
                  Send
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
