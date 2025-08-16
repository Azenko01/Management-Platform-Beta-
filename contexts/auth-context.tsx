"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { type User, authStore } from "@/lib/auth-store"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  updateUser: (updates: Partial<Omit<User, "id" | "createdAt">>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initialize auth state from localStorage
    const currentUser = authStore.getCurrentUser()
    const authenticated = authStore.isAuthenticated()

    setUser(currentUser)
    setIsAuthenticated(authenticated)
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const result = await authStore.login(email, password)
    if (result.success && result.user) {
      setUser(result.user)
      setIsAuthenticated(true)
    }
    return result
  }

  const signup = async (email: string, password: string, name: string) => {
    const result = await authStore.signup(email, password, name)
    if (result.success && result.user) {
      setUser(result.user)
      setIsAuthenticated(true)
    }
    return result
  }

  const logout = () => {
    authStore.logout()
    setUser(null)
    setIsAuthenticated(false)
  }

  const updateUser = (updates: Partial<Omit<User, "id" | "createdAt">>) => {
    const updatedUser = authStore.updateUser(updates)
    if (updatedUser) {
      setUser(updatedUser)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        signup,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
