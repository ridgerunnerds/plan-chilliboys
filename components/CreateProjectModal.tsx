'use client'

import { useState } from 'react'
import { saveProject, Project } from '@/lib/storage'

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: () => void
}

export default function CreateProjectModal({ isOpen, onClose, onCreated }: CreateProjectModalProps) {
  const [title, setTitle] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [description, setDescription] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim() || !clientName.trim()) {
      setError('Project title and client name are required.')
      return
    }

    if (!clientEmail.trim() && !phone.trim()) {
      setError('Please provide at least an email or a WhatsApp / phone number.')
      return
    }

    const project: Project = {
      id: `proj-${Date.now()}`,
      userId: `guest-${Date.now()}`,
      userName: clientName.trim(),
      userEmail: clientEmail.trim() || '(no email)',
      title: title.trim(),
      description: description.trim(),
      phone: phone.trim() || undefined,
      status: 'pending',
      feedback: [],
      createdAt: new Date().toISOString(),
    }

    await saveProject(project)
    setTitle('')
    setClientName('')
    setClientEmail('')
    setDescription('')
    setPhone('')
    setError('')
    onCreated()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-steel-900 border border-steel-700 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Add Project</h2>
            <button
              onClick={onClose}
              className="text-steel-400 hover:text-white transition-colors text-2xl leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-2 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-chilliblue-200 mb-1">
                Project title *
              </label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Custom Front Gate"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-chilliblue-200 mb-1">
                Client name *
              </label>
              <input
                type="text"
                className="input"
                placeholder="John Doe"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-chilliblue-200 mb-1">
                  Client email
                </label>
                <input
                  type="email"
                  className="input"
                  placeholder="john@example.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-chilliblue-200 mb-1">
                  WhatsApp / Phone
                </label>
                <input
                  type="tel"
                  className="input"
                  placeholder="+52 624 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <p className="text-xs text-steel-500">
              At least one contact method (email or WhatsApp) is required.
            </p>

            <div>
              <label className="block text-sm font-medium text-chilliblue-200 mb-1">
                Description
              </label>
              <textarea
                className="input w-full h-24 resize-none"
                placeholder="Project details, materials, dimensions..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex-1"
              >
                Create Project
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
