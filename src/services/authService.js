import { delay, ok, fail, safeParse, safeSet } from './utils'
import { DEMO_USER } from '../data/seedData'
import { getLocalAvatar } from '../data/localImages'

const USERS_KEY = 'alclo_users'
const SESSION_KEY = 'alclo_session'
const LEGACY_DEMO_EMAIL = 'demo@alclo.app'

function syncDemoUser(users) {
  const demoIndex = users.findIndex(
    (user) =>
      user.id === DEMO_USER.id ||
      user.email?.toLowerCase() === LEGACY_DEMO_EMAIL,
  )

  if (demoIndex === -1) {
    users.push(DEMO_USER)
    safeSet(USERS_KEY, users)
    return users
  }

  const existingUser = users[demoIndex]
  const mergedDemoUser = {
    ...existingUser,
    ...DEMO_USER,
    createdAt: existingUser.createdAt || DEMO_USER.createdAt,
    preferences: { ...DEMO_USER.preferences, ...existingUser.preferences },
  }

  users[demoIndex] = mergedDemoUser
  safeSet(USERS_KEY, users)

  const session = safeParse(SESSION_KEY, null)
  if (session?.id === DEMO_USER.id) {
    const { password: _, ...safeUser } = mergedDemoUser
    safeSet(SESSION_KEY, safeUser)
  }

  return users
}

function getUsers() {
  const users = safeParse(USERS_KEY, [])
  return syncDemoUser(users)
}

export const authService = {
  async signup({ name, email, password }) {
    await delay(500)
    const users = getUsers()
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return fail('EMAIL_TAKEN', 'An account with this email already exists.')
    }
    const newUser = {
      id: `user-${Date.now()}`, name, email, password,
      createdAt: new Date().toISOString(),
      preferences: { darkMode: false, defaultOccasion: 'Casual', temperatureUnit: 'C' },
      avatar: getLocalAvatar(email),
    }
    users.push(newUser)
    safeSet(USERS_KEY, users)
    const { password: _, ...safeUser } = newUser
    safeSet(SESSION_KEY, safeUser)
    return ok(safeUser)
  },

  async login({ email, password }) {
    await delay(600)
    const users = getUsers()
    const normalizedEmail = email.toLowerCase() === LEGACY_DEMO_EMAIL
      ? DEMO_USER.email.toLowerCase()
      : email.toLowerCase()
    const user = users.find(u => u.email.toLowerCase() === normalizedEmail)
    if (!user || user.password !== password) {
      return fail('INVALID_CREDENTIALS', 'Invalid email or password.')
    }
    const { password: _, ...safeUser } = user
    safeSet(SESSION_KEY, safeUser)
    return ok(safeUser)
  },

  logout() {
    localStorage.removeItem(SESSION_KEY)
  },

  getCurrentUser() {
    const session = safeParse(SESSION_KEY, null)
    if (session?.id !== DEMO_USER.id) return session

    const users = getUsers()
    const demoUser = users.find((user) => user.id === DEMO_USER.id)
    if (!demoUser) return session

    const { password: _, ...safeUser } = demoUser
    safeSet(SESSION_KEY, safeUser)
    return safeUser
  },

  isAuthenticated() {
    return !!this.getCurrentUser()
  },

  async updateUserPreferences(prefs) {
    await delay(300)
    const session = safeParse(SESSION_KEY, null)
    if (!session) return fail('NOT_AUTHENTICATED', 'Not authenticated.')
    const users = getUsers()
    const idx = users.findIndex(u => u.id === session.id)
    if (idx === -1) return fail('NOT_FOUND', 'User not found.')
    users[idx].preferences = { ...users[idx].preferences, ...prefs }
    safeSet(USERS_KEY, users)
    const { password: _, ...safeUser } = users[idx]
    const updated = { ...safeUser, preferences: users[idx].preferences }
    safeSet(SESSION_KEY, updated)
    return ok(updated)
  },
}
