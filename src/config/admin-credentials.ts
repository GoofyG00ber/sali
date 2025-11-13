// Simple frontend admin credentials helper.
// WARNING: This stores the password in localStorage in plain text for convenience in
// development. For production you MUST move admin authentication to a secure backend.

const DEFAULT_USERNAME = 'admin'
const DEFAULT_PASSWORD = 'admin123'
const STORAGE_KEY = 'sali_admin_password'

const getStoredPassword = () => {
  try {
    const p = localStorage.getItem(STORAGE_KEY)
    return p ?? DEFAULT_PASSWORD
  } catch {
    // localStorage may be unavailable in some environments
    return DEFAULT_PASSWORD
  }
}

export const ADMIN_CONFIG = {
  username: DEFAULT_USERNAME,
  // verifyPassword returns a Promise to match async usage in the auth store
  async verifyPassword(password: string): Promise<boolean> {
    const stored = getStoredPassword()
    return password === stored
  },
  // setPassword persists new password to localStorage (development only)
  async setPassword(newPassword: string): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEY, newPassword)
    } catch (e) {
      console.warn('Failed to persist admin password to localStorage', e)
    }
  }
}
