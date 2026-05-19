const USERS_KEY = 'chilliboys_users'
const PROJECTS_KEY = 'chilliboys_projects'
const STORYBOARDS_KEY = 'chilliboys_storyboards'
const SESSION_KEY = 'chilliboys_session'

export interface User {
  id: string
  email: string
  name: string
  role: 'client' | 'pm' | 'admin'
  password: string
  createdAt: string
}

export interface Project {
  id: string
  userId: string
  userName: string
  userEmail: string
  title: string
  description: string
  storyboardId?: string
  status: 'pending' | 'in_review' | 'quoted' | 'approved' | 'in_progress' | 'completed'
  quote?: number
  feedback: FeedbackMessage[]
  createdAt: string
}

export interface FeedbackMessage {
  id: string
  from: string
  fromRole: string
  message: string
  createdAt: string
}

export interface Storyboard {
  id: string
  userId: string
  name: string
  elements: StoryboardElement[]
  createdAt: string
  updatedAt: string
}

export interface StoryboardElement {
  id: string
  type: 'image' | 'text' | 'shape' | 'note'
  x: number
  y: number
  width: number
  height: number
  content: string
  color?: string
  rotation?: number
}

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function setItem<T>(key: string, value: T) {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

export function getUsers(): User[] {
  return getItem<User[]>(USERS_KEY, [])
}

export function saveUser(user: User) {
  const users = getUsers()
  const existing = users.findIndex((u) => u.email === user.email)
  if (existing >= 0) {
    users[existing] = user
  } else {
    users.push(user)
  }
  setItem(USERS_KEY, users)
}

export function getUserByEmail(email: string): User | undefined {
  return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase())
}

export function getProjects(): Project[] {
  return getItem<Project[]>(PROJECTS_KEY, [])
}

export function saveProject(project: Project) {
  const projects = getProjects()
  const existing = projects.findIndex((p) => p.id === project.id)
  if (existing >= 0) {
    projects[existing] = project
  } else {
    projects.push(project)
  }
  setItem(PROJECTS_KEY, projects)
}

export function deleteProject(id: string) {
  const projects = getProjects().filter((p) => p.id !== id)
  setItem(PROJECTS_KEY, projects)
}

export function getStoryboards(): Storyboard[] {
  return getItem<Storyboard[]>(STORYBOARDS_KEY, [])
}

export function saveStoryboard(storyboard: Storyboard) {
  const storyboards = getStoryboards()
  const existing = storyboards.findIndex((s) => s.id === storyboard.id)
  if (existing >= 0) {
    storyboards[existing] = storyboard
  } else {
    storyboards.push(storyboard)
  }
  setItem(STORYBOARDS_KEY, storyboards)
}

export function getSession(): { user: User } | null {
  return getItem<{ user: User } | null>(SESSION_KEY, null)
}

export function setSession(session: { user: User } | null) {
  setItem(SESSION_KEY, session)
}

export function clearSession() {
  setItem(SESSION_KEY, null)
}

export function seedDemoData() {
  if (typeof window === 'undefined') return
  const users = getUsers()
  if (users.length === 0) {
    const admin: User = {
      id: 'admin-1',
      email: 'admin@chilliboys.mx',
      name: 'Admin',
      role: 'admin',
      password: 'admin123',
      createdAt: new Date().toISOString(),
    }
    const pm: User = {
      id: 'pm-1',
      email: 'pm@chilliboys.mx',
      name: 'Project Manager',
      role: 'pm',
      password: 'pm123',
      createdAt: new Date().toISOString(),
    }
    saveUser(admin)
    saveUser(pm)
  }
}
