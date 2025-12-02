// Simple frontend admin credentials helper.
// WARNING: This stores the password in localStorage in plain text for convenience in
// development. For production you MUST move admin authentication to a secure backend.
//
// You can set `VITE_ADMIN_PASSWORD` in the frontend project's root `.env` to
// provide the admin password at build/runtime. When present, the env value is
// preferred over any stored/local password.

const DEFAULT_USERNAME = 'admin'
const DEFAULT_PASSWORD = 'admin123'
const STORAGE_KEY = 'sali_admin_password'

const getEnvPassword = (): string | null => {
  try {
    // Vite exposes variables starting with VITE_ via import.meta.env
    // Use a permissive cast because custom vars are not typed by default
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const env: any = import.meta.env
    const p = env?.VITE_ADMIN_PASSWORD as string | undefined
    return p ?? null
  } catch {
    return null
  }
}

const getStoredPassword = () => {
  try {
    const envPass = getEnvPassword()
    if (envPass) return envPass

    const p = localStorage.getItem(STORAGE_KEY)
    return p ?? DEFAULT_PASSWORD
  } catch {
    // localStorage or import.meta may be unavailable in some environments
    const envPass = getEnvPassword()
    return envPass ?? DEFAULT_PASSWORD
  }
}

export const ADMIN_CONFIG = {
  username: DEFAULT_USERNAME,
  // verifyPassword returns a Promise to match async usage in the auth store
  async verifyPassword(password: string): Promise<boolean> {
    // Try server-side verification first
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      if (res.ok) {
        const json = await res.json()
        if (typeof json.valid === 'boolean') return json.valid
      }
    } catch {
      // Network error or server not available; fall back to local checks
    }

    const stored = getStoredPassword()
    return password === stored
  },
  // setPassword persists new password to server (preferred) and falls back to localStorage
  // signature: setPassword(oldPassword, newPassword) OR setPassword(newPassword)
  async setPassword(arg1: string, arg2?: string): Promise<void> {
    const oldPassword = arg2 ? arg1 : undefined
    const newPassword = arg2 ? arg2 : arg1

    // Try to update via server API
    try {
      const res = await fetch('/api/admin/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword })
      })
      if (res.ok) {
        const json = await res.json()
        if (json && json.success) return
      }
    } catch {
      // ignore and fall back to localStorage
    }

    // Fall back: persist to localStorage (development only)
    try {
      localStorage.setItem(STORAGE_KEY, newPassword)
    } catch (e) {
      console.warn('Failed to persist admin password to localStorage', e)
    }
  }
}
