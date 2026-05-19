'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { getUserByEmail } from '@/lib/storage'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const user = getUserByEmail(email)
    if (!user || user.password !== password) {
      setError('Invalid email or password')
      return
    }
    login(user)
    if (user.role === 'admin') router.push('/admin')
    else if (user.role === 'pm') router.push('/pm')
    else router.push('/dashboard')
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Log In</h1>
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
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
            Log In
          </button>
        </form>
        <p className="text-center text-steel-400 text-sm mt-4">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-chilliblue-400 hover:text-chilliblue-300">
            Sign up
          </Link>
        </p>
        <div className="mt-6 pt-4 border-t border-steel-700 text-xs text-steel-500">
          <p>Demo accounts:</p>
          <p>admin@chilliboys.mx / admin123</p>
          <p>pm@chilliboys.mx / pm123</p>
        </div>
      </div>
    </div>
  )
}
