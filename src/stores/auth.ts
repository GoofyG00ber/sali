import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ADMIN_CONFIG } from "../config/admin-credentials";

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const loginAttempts = ref(0)
  const isLocked = ref(false)

  // Check if user is logged in
  const checkAuth = () => {
    const authToken = sessionStorage.getItem('admin_auth')
    if (authToken === 'authenticated') {
      isAuthenticated.value = true
      return true
    }
    return false
  }

  // Login function
  const login = async (password: string): Promise<boolean> => {
    if (isLocked.value) {
      return false
    }

    const isValid = await ADMIN_CONFIG.verifyPassword(password)

    if (isValid) {
      isAuthenticated.value = true
      sessionStorage.setItem('admin_auth', 'authenticated')
      loginAttempts.value = 0
      return true
    } else {
      loginAttempts.value++
      if (loginAttempts.value >= 5) {
        isLocked.value = true
        setTimeout(() => {
          isLocked.value = false
          loginAttempts.value = 0
        }, 300000) // 5 minutes lockout
      }
      return false
    }
  }

  // Logout function
  const logout = () => {
    isAuthenticated.value = false
    sessionStorage.removeItem('admin_auth')
  }

  // Change password function
  const changePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    const isValid = await ADMIN_CONFIG.verifyPassword(oldPassword)
    if (isValid) {
      // In production, this would update the password in a secure backend
      console.log('Password would be changed to:', newPassword)
      // You'd need to implement actual password change logic
      return true
    }
    return false
  }

  // Initialize auth state
  checkAuth()

  return {
    isAuthenticated,
    loginAttempts,
    isLocked,
    login,
    logout,
    checkAuth,
    changePassword
  }
})
