'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from './AuthProvider'

export default function Navbar() {
  const { user, logout } = useAuth()

  const roleLinks = () => {
    if (!user) return null
    if (user.role === 'admin') {
      return (
        <Link href="/admin" className="text-chilliblue-200 hover:text-white transition-colors">
          Admin
        </Link>
      )
    }
    if (user.role === 'pm') {
      return (
        <Link href="/pm" className="text-chilliblue-200 hover:text-white transition-colors">
          PM Dashboard
        </Link>
      )
    }
    return (
      <>
        <Link href="/storyboard" className="text-chilliblue-200 hover:text-white transition-colors">
          Storyboard
        </Link>
        <Link href="/dashboard" className="text-chilliblue-200 hover:text-white transition-colors">
          My Projects
        </Link>
      </>
    )
  }

  return (
    <nav className="sticky top-0 z-50 bg-chilliblue-900/90 backdrop-blur-md border-b border-chilliblue-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src="/logo.png"
              alt="Chilli Boys"
              width={36}
              height={30}
              className="rounded"
              style={{ objectFit: 'contain' }}
            />
            <div className="flex flex-col">
              <span className="text-xl font-bold text-white leading-tight">Chilli Boys</span>
              <span className="text-[10px] text-chilliblue-300 leading-tight tracking-wider uppercase">Manufacturing</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-chilliblue-200 hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/catalog" className="text-chilliblue-200 hover:text-white transition-colors">
              Catalog
            </Link>
            <Link href="/plan" className="text-chilliblue-200 hover:text-white transition-colors">
              Get a Quote
            </Link>
            {roleLinks()}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-chilliblue-300 hidden sm:inline">
                  {user.name}
                </span>
                <button onClick={logout} className="btn-secondary text-sm py-1.5 px-4">
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/login" className="btn-primary text-sm py-1.5 px-4">
                Log In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden border-t border-chilliblue-800 px-4 py-2 flex space-x-4 overflow-x-auto">
        <Link href="/" className="text-sm text-chilliblue-200 whitespace-nowrap">Home</Link>
        <Link href="/catalog" className="text-sm text-chilliblue-200 whitespace-nowrap">Catalog</Link>
        <Link href="/plan" className="text-sm text-chilliblue-200 whitespace-nowrap">Get a Quote</Link>
        {user?.role === 'client' && (
          <>
            <Link href="/storyboard" className="text-sm text-chilliblue-200 whitespace-nowrap">Storyboard</Link>
            <Link href="/dashboard" className="text-sm text-chilliblue-200 whitespace-nowrap">My Projects</Link>
          </>
        )}
        {user?.role === 'admin' && (
          <Link href="/admin" className="text-sm text-chilliblue-200 whitespace-nowrap">Admin</Link>
        )}
        {user?.role === 'pm' && (
          <Link href="/pm" className="text-sm text-chilliblue-200 whitespace-nowrap">PM</Link>
        )}
      </div>
    </nav>
  )
}
