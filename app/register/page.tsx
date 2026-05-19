'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { register as storageRegister, getUserByEmail } from '@/lib/storage'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { setUser } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const existing = await getUserByEmail(email)
    if (existing) {
      setError('An account with that email already exists')
      return
    }

    const user = await storageRegister(name.trim(), email.trim().toLowerCase(), password)
    if (!user) {
      setError('Failed to create account. Please try again.')
      return
    }

    setUser(user)
    router.push('/dashboard')
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Create Account</h1>
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-chilliblue-200 mb-1">Full name</label>
            <input
              type="text"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-chilliblue-200 mb-1">Email</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-chilliblue-200 mb-1">Password</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full">
            Create Account
          </button>
        </form>
        <p className="text-center text-steel-400 text-sm mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-chilliblue-400 hover:text-chilliblue-300">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
