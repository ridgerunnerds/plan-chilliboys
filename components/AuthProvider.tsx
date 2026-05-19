'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { User, getSession, logout as storageLogout, seedDemoData } from '@/lib/storage'

interface AuthContextType {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  logout: async () => {},
  loading: true,
})

export function useAuth() {
  return useContext(AuthContext)
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function init() {
      await seedDemoData()
      const session = await getSession()
      if (mounted) {
        if (session?.user) setUser(session.user)
        setLoading(false)
      }
    }
    init()
    return () => { mounted = false }
  }, [])

  const logout = async () => {
    await storageLogout()
    setUser(null)
    window.location.href = '/'
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
