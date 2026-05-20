import { supabase } from './supabase'

/* ─── Types ─── */
export interface FeedbackMessage {
  id: string
  from: string
  fromRole: 'client' | 'pm' | 'admin'
  message: string
  createdAt: string
}

export interface PromptRevision {
  id: string
  text: string
  createdAt: number
}

export interface ImageRevision {
  id: string
  url: string
  promptId?: string
  createdAt: number
}

export interface StoryboardElement {
  id: string
  type: 'text' | 'shape' | 'image' | 'note' | 'title' | 'upload' | 'service' | 'concept' | 'swatch'
  x: number
  y: number
  width?: number
  height?: number
  content?: string
  color?: string
  fontSize?: number
  fillOpacity?: number
  borderColor?: string
  borderWidth?: number
  /* AI image generation fields (for 'image' type) */
  prompt?: string
  promptHistory?: PromptRevision[]
  images?: ImageRevision[]
  currentImageIndex?: number
  isGenerating?: boolean
  /* Catalog data (for service, concept, swatch types) */
  data?: {
    name?: string
    title?: string
    description?: string
    image?: string
    color?: string
    materials?: string[]
    tags?: string[]
  }
}

export interface User {
  id: string
  email: string
  name: string
  role: 'client' | 'pm' | 'admin'
  password?: string // kept for compat; not stored locally with Supabase
  createdAt: string
}

export interface Project {
  id: string
  userId: string
  userName: string
  userEmail: string
  title: string
  description: string
  status: 'pending' | 'in_review' | 'quoted' | 'approved' | 'in_progress' | 'completed'
  quote?: number
  phone?: string
  storyboardId?: string
  feedback: FeedbackMessage[]
  createdAt: string
}

export interface Storyboard {
  id: string
  userId: string
  name: string
  elements: StoryboardElement[]
  createdAt: string
  updatedAt?: string
}

/* ─── Helpers ─── */
function toUser(row: any): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    createdAt: row.created_at,
  }
}

function toProject(row: any): Project {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    userEmail: row.user_email,
    title: row.title,
    description: row.description,
    status: row.status,
    quote: row.quote ?? undefined,
    phone: row.phone || undefined,
    storyboardId: row.storyboard_id || undefined,
    feedback: row.feedback || [],
    createdAt: row.created_at,
  }
}

function toStoryboard(row: any): Storyboard {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    elements: row.elements || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at || undefined,
  }
}

function userFromAuth(authUser: any): User {
  const meta = authUser.user_metadata || {}
  return {
    id: authUser.id,
    email: authUser.email || '',
    name: meta.name || authUser.email?.split('@')[0] || 'User',
    role: meta.role || 'client',
    createdAt: authUser.created_at || new Date().toISOString(),
  }
}

async function fetchProfile(userId: string): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .limit(1)
    if (error) {
      console.error('fetchProfile error:', error)
      return null
    }
    if (!data || data.length === 0) {
      console.log('fetchProfile: no profile found for', userId)
      return null
    }
    console.log('fetchProfile: found profile', data[0])
    return data[0]
  } catch (err) {
    console.error('fetchProfile exception:', err)
    return null
  }
}

async function ensureProfile(authUser: any): Promise<User> {
  const profile = await fetchProfile(authUser.id)
  if (profile) {
    const user = toUser(profile)
    console.log('ensureProfile: using DB profile, role=', user.role)
    return user
  }

  const user = userFromAuth(authUser)
  console.log('ensureProfile: falling back to auth metadata, role=', user.role)
  try {
    await supabase.from('profiles').insert({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      created_at: user.createdAt,
    })
  } catch {
    // profile may already exist or table is down — fallback metadata keeps app working
  }
  return user
}

/* ─── Auth ─── */
export async function login(email: string, password: string): Promise<{ user: User | null; error?: string }> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { user: null, error: error.message }
  if (!data.user) return { user: null, error: 'No user returned' }
  const user = await ensureProfile(data.user)
  return { user }
}

export async function register(
  name: string,
  email: string,
  password: string,
  role = 'client'
): Promise<User | null> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, role } },
  })
  if (error || !data.user) {
    console.error('Registration error:', error)
    return null
  }
  // Trigger auto-creates profile from metadata; fallback to metadata if table is down
  return userFromAuth(data.user)
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut()
}

export async function getSession(): Promise<{ user: User } | null> {
  const { data } = await supabase.auth.getSession()
  if (!data.session) return null
  const user = await ensureProfile(data.session.user)
  return { user }
}

export function setSession(_session: { user: User } | null): void {
  // no-op – session is managed by Supabase client
}

export function clearSession(): void {
  // no-op – use logout()
}

/* ─── Users ─── */
export async function getUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    if (error || !data) return []
    return data.map(toUser)
  } catch {
    return []
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('email', email)
      .limit(1)
    if (error || !data || data.length === 0) return null
    return toUser(data[0])
  } catch {
    return null
  }
}

export async function saveUser(user: User): Promise<void> {
  if (user.password && user.password.length > 0) {
    // Creating a new user with a password — use raw Auth API so we don't
    // mess with the current session.
    const url = 'https://havxhrpvkmqknsmehiqo.supabase.co'
    const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhdnhocnB2a21xa25zbWVoaXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMDgzMTgsImV4cCI6MjA5NDc4NDMxOH0.FzzBarHZwk11YICVjceM8M8KDROhuZ9SkTT2jIdZRpw'

    const res = await fetch(`${url}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      credentials: 'omit',
      body: JSON.stringify({
        email: user.email,
        password: user.password,
        data: { name: user.name, role: user.role },
      }),
    })

    const authData = await res.json()
    if (!res.ok) {
      throw new Error(authData.msg || authData.error_description || authData.message || `Auth error ${res.status}`)
    }

    const authUserId = authData.id || authData.user?.id
    if (!authUserId) throw new Error('User created but no ID returned')

    // Trigger should have created the profile, but upsert to be safe
    try {
      await supabase.from('profiles').upsert({
        id: authUserId,
        email: user.email,
        name: user.name,
        role: user.role,
        created_at: user.createdAt || new Date().toISOString(),
      })
    } catch {
      // ignore — profile may already exist from trigger
    }
  } else {
    const { error } = await supabase
      .from('profiles')
      .update({ name: user.name, email: user.email, role: user.role })
      .eq('id', user.id)
    if (error) throw new Error(error.message)
  }
}

export async function deleteUser(id: string): Promise<void> {
  // We cannot delete auth.users rows from the client (needs service-role key),
  // but deleting the profile removes the user from the app's perspective.
  const { error } = await supabase.from('profiles').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

/* ─── Projects ─── */
export async function getProjects(): Promise<Project[]> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
    if (error || !data) return []
    return data.map(toProject)
  } catch {
    return []
  }
}

export async function saveProject(project: Project): Promise<void> {
  const { error } = await supabase.from('projects').upsert({
    id: project.id,
    user_id: project.userId,
    user_name: project.userName,
    user_email: project.userEmail,
    title: project.title,
    description: project.description,
    status: project.status,
    quote: project.quote ?? null,
    phone: project.phone || null,
    storyboard_id: project.storyboardId || null,
    feedback: project.feedback,
    created_at: project.createdAt,
  })
  if (error) {
    console.error('saveProject error:', error)
    throw new Error(error.message)
  }
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

/* ─── Storyboards ─── */
export async function getStoryboards(): Promise<Storyboard[]> {
  try {
    const { data, error } = await supabase
      .from('storyboards')
      .select('*')
      .order('created_at', { ascending: false })
    if (error || !data) return []
    return data.map(toStoryboard)
  } catch {
    return []
  }
}

export async function saveStoryboard(storyboard: Storyboard): Promise<void> {
  const { error } = await supabase.from('storyboards').upsert({
    id: storyboard.id,
    user_id: storyboard.userId,
    name: storyboard.name,
    elements: storyboard.elements,
    created_at: storyboard.createdAt,
    updated_at: storyboard.updatedAt || new Date().toISOString(),
  })
  if (error) throw new Error(error.message)
}

/* ─── Seed demo accounts ─── */
export async function seedDemoData(): Promise<void> {
  const url = 'https://havxhrpvkmqknsmehiqo.supabase.co'
  const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhdnhocnB2a21xa25zbWVoaXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMDgzMTgsImV4cCI6MjA5NDc4NDMxOH0.FzzBarHZwk11YICVjceM8M8KDROhuZ9SkTT2jIdZRpw'

  async function ensureDemoUser(email: string, password: string, name: string, role: string) {
    // Check if user already exists in profiles
    const { data: existing } = await supabase.from('profiles').select('id').eq('email', email).limit(1)
    if (existing && existing.length > 0) return

    try {
      const res = await fetch(`${url}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        credentials: 'omit',
        body: JSON.stringify({ email, password, data: { name, role } }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        console.log('seedDemoData: signup skipped for', email, '-', err.msg || err.message || res.status)
        return
      }
      const authData = await res.json()
      const authId = authData.id || authData.user?.id
      if (authId) {
        await supabase.from('profiles').upsert({ id: authId, email, name, role })
      }
    } catch (e: any) {
      console.log('seedDemoData: error for', email, '-', e.message)
    }
  }

  await ensureDemoUser('admin@chilliboys.mx', 'admin123', 'Admin', 'admin')
  await ensureDemoUser('pm@chilliboys.mx', 'pm123', 'Project Manager', 'pm')
}
