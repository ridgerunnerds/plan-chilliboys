'use client'

import { useState, useEffect } from 'react'
import { saveUser, deleteUser, User, getUsers } from '@/lib/storage'

interface ManageUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
  user?: User | null
}

export default function ManageUserModal({ isOpen, onClose, onSaved, user }: ManageUserModalProps) {
  const isEdit = !!user
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'client' | 'pm' | 'admin'>('client')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      if (user) {
        setName(user.name)
        setEmail(user.email)
        setRole(user.role)
        setPassword('')
      } else {
        setName('')
        setEmail('')
        setPassword('')
        setRole('client')
      }
      setError('')
    }
  }, [isOpen, user])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim() || !email.trim()) {
      setError('Name and email are required.')
      return
    }

    if (!isEdit && !password.trim()) {
      setError('Password is required for new users.')
      return
    }

    const users = await getUsers()
    const emailTaken = users.some(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.id !== user?.id
    )
    if (emailTaken) {
      setError('That email is already in use.')
      return
    }

    try {
      await saveUser({
        id: user?.id || `user-${Date.now()}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
        password: password.trim() || undefined,
        createdAt: user?.createdAt || new Date().toISOString(),
      })
      onSaved()
    } catch (err: any) {
      setError(err.message || 'Failed to save user')
    }
  }

  const handleDelete = async () => {
    if (!user) return
    if (!confirm(`Delete user ${user.name} (${user.email})? This cannot be undone.`)) return
    try {
      await deleteUser(user.id)
      onSaved()
    } catch (err: any) {
      setError(err.message || 'Failed to delete user')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-steel-900 border border-steel-700 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">
              {isEdit ? 'Edit User' : 'Add User'}
            </h2>
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
              <label className="block text-sm font-medium text-chilliblue-200 mb-1">Full name *</label>
              <input
                type="text"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-chilliblue-200 mb-1">Email *</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-chilliblue-200 mb-1">Role *</label>
              <select
                className="input"
                value={role}
                onChange={(e) => setRole(e.target.value as 'client' | 'pm' | 'admin')}
              >
                <option value="client">Client</option>
                <option value="pm">Project Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-chilliblue-200 mb-1">
                {isEdit ? 'New password (leave blank to keep current)' : 'Password *'}
              </label>
              <input
                type="text"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isEdit ? '••••••••' : ''}
                required={!isEdit}
              />
            </div>

            <div className="flex gap-3 pt-2">
              {isEdit && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="bg-red-900/50 hover:bg-red-800 text-red-200 px-4 py-2 rounded-lg transition-colors"
                >
                  Delete
                </button>
              )}
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
                {isEdit ? 'Save Changes' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
