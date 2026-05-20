'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import CreateProjectModal from '@/components/CreateProjectModal'
import { formatWhatsAppMessage, openWhatsApp, GREG_WHATSAPP } from '@/lib/whatsapp'
import { User, Project, Storyboard, getUsers, getProjects, getStoryboards, saveProject, FeedbackMessage } from '@/lib/storage'

export default function PMPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [storyboards, setStoryboards] = useState<Storyboard[]>([])
  const [activeTab, setActiveTab] = useState<'projects' | 'users' | 'storyboards'>('projects')
  const [replyText, setReplyText] = useState<Record<string, string>>({})
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (!loading && (!user || user.role !== 'pm')) {
      router.push('/')
      return
    }
    async function load() {
      const [p, u, s] = await Promise.all([getProjects(), getUsers(), getStoryboards()])
      setProjects(p)
      setUsers(u)
      setStoryboards(s)
    }
    if (user?.role === 'pm') load()
  }, [user, loading, router])

  if (loading) return <div className="p-12 text-center text-steel-400">Loading...</div>
  if (!user || user.role !== 'pm') return null

  const updateStatus = async (project: Project, status: Project['status']) => {
    const updated = { ...project, status }
    await saveProject(updated)
    setProjects(projects.map((p) => (p.id === project.id ? updated : p)))
  }

  const sendReply = async (projectId: string) => {
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
    await saveProject(updated)
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Project Manager Dashboard</h1>
          <p className="text-steel-400 text-sm">Review client projects, users, and storyboards.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary text-sm py-2 px-4 self-start sm:self-auto"
        >
          + Add Project
        </button>
      </div>

      <CreateProjectModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreated={async () => {
          setShowModal(false)
          setProjects(await getProjects())
        }}
      />

      <div className="flex space-x-2 mb-6">
        {(['projects', 'users', 'storyboards'] as const).map((tab) => (
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
                <th className="pb-2 pr-4">Joined</th>
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
                  <td className="py-3 pr-4 text-steel-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'storyboards' && (
        <div>
          {storyboards.length === 0 && (
            <div className="card text-center py-12">
              <p className="text-steel-400">No storyboards yet.</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {storyboards.map((sb) => {
              const creator = users.find((u) => u.id === sb.userId)
              return (
                <div key={sb.id} className="card">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-white">{sb.name}</h3>
                    <span className="text-xs text-steel-500">{sb.elements.length} elements</span>
                  </div>
                  <p className="text-xs text-steel-400 mb-2">
                    By: {creator ? `${creator.name} (${creator.email})` : sb.userId}
                  </p>
                  <p className="text-xs text-steel-500">
                    {new Date(sb.createdAt).toLocaleDateString()}
                  </p>
                  {sb.elements.length > 0 && (
                    <div className="mt-3 p-2 bg-steel-900/50 rounded border border-steel-700 h-24 overflow-hidden relative">
                      {sb.elements.slice(0, 5).map((el) => (
                        <div
                          key={el.id}
                          className="absolute text-[8px] text-steel-500 border border-steel-700 rounded"
                          style={{
                            left: `${(el.x / 600) * 100}%`,
                            top: `${(el.y / 400) * 100}%`,
                            width: `${((el.width || 40) / 600) * 100}%`,
                            height: `${((el.height || 30) / 400) * 100}%`,
                            backgroundColor: el.type === 'shape' ? (el.color || '#005ce6') : undefined,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
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
                    {project.userName}{project.userEmail && project.userEmail !== '(no email)' ? ` (${project.userEmail})` : ''} — {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-3 py-1 rounded-full border capitalize ${statusColor(project.status)}`}>
                    {project.status.replace('_', ' ')}
                  </span>
                  {project.quote !== undefined && (
                    <span className="text-sm font-bold text-green-400">
                      ${project.quote.toLocaleString()} MXN
                    </span>
                  )}
                </div>
              </div>

              <p className="text-steel-300 text-sm mb-4">{project.description}</p>

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
                <button
                  onClick={() => {
                    const msg = formatWhatsAppMessage(project)
                    openWhatsApp(GREG_WHATSAPP, msg)
                  }}
                  className="text-xs bg-green-900/50 hover:bg-green-800 text-green-200 px-3 py-1 rounded transition-colors flex items-center gap-1.5 ml-auto"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Send to Greg
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
