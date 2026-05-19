'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, getSession, setSession, clearSession, seedDemoData } from '@/lib/storage'

interface AuthContextType {
  user: User | null
  login: (user: User) => void
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  loading: true,
})

export function useAuth() {
  return useContext(AuthContext)
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    seedDemoData()
    const session = getSession()
    if (session?.user) {
      setUser(session.user)
    }
    setLoading(false)
  }, [])

  const login = (user: User) => {
    setSession({ user })
    setUser(user)
  }

  const logout = () => {
    clearSession()
    setUser(null)
    window.location.href = '/'
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
